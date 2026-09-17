import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CardGame } from "@/domain/games";

const mocks = vi.hoisted(() => ({
    loadTierListCardGames: vi.fn(),
    loadSeriesGameLinks: vi.fn(),
    writeJsonFile: vi.fn(),
    getRelatedGames: vi.fn(),
}));

vi.mock("./common/games-tier-list-extractor", () => ({
    loadTierListCardGames: mocks.loadTierListCardGames,
}));
vi.mock("./common/runExtractor", () => ({ writeJsonFile: mocks.writeJsonFile }));
vi.mock("./series", () => ({ loadSeriesGameLinks: mocks.loadSeriesGameLinks }));
vi.mock("@/domain/discovery/relatedGames", () => ({ getRelatedGames: mocks.getRelatedGames }));

import { extractAndSaveRelatedGames } from "./related-games";

const card = (id: string, title: string): CardGame => ({
    id,
    title,
    genres: [1],
    platform: 1,
    duration: "01:00:00",
    imagePath: `/covers/${id}/cover.webp`,
    url: `https://www.youtube.com/watch?v=${id}`,
    url_type: "VIDEO",
} as CardGame);

describe("extractAndSaveRelatedGames shared helpers", () => {
    beforeEach(() => vi.clearAllMocks());

    it("loads shared card metadata and series order, then writes only compact fields", async () => {
        const target = card("target", "Target");
        const candidate = card("candidate", "Candidate");
        mocks.loadTierListCardGames
            .mockReturnValueOnce([{ databaseId: 1, game: target, category: "tier_not_evaluated" }])
            .mockReturnValueOnce([{ databaseId: 2, game: candidate, category: "tier_good" }]);
        mocks.loadSeriesGameLinks.mockReturnValue([
            { game: 1, series: 7, order: 2 },
            { game: 2, series: 7, order: 1 },
        ]);
        mocks.getRelatedGames.mockReturnValue([{ game: candidate, score: 123 }]);

        await extractAndSaveRelatedGames({} as never, "/tmp/related-games.json");

        expect(mocks.loadTierListCardGames).toHaveBeenNthCalledWith(1, {}, "games_in_future", true);
        expect(mocks.loadTierListCardGames).toHaveBeenNthCalledWith(2, {}, "games_in_present", true);
        expect(mocks.loadSeriesGameLinks).toHaveBeenCalledWith({});
        expect(mocks.getRelatedGames).toHaveBeenCalledWith(target, [candidate], {
            seriesMap: {
                target: { id: "7", order: 2 },
                candidate: { id: "7", order: 1 },
            },
            tierMap: { candidate: "tier_good" },
            limit: 12,
        });
        expect(mocks.writeJsonFile).toHaveBeenCalledWith("/tmp/related-games.json", {
            target: [{
                id: "candidate",
                title: "Candidate",
                imagePath: "/covers/candidate/cover.webp",
                url: "https://www.youtube.com/watch?v=candidate",
                url_type: "VIDEO",
            }],
        });
    });
});
