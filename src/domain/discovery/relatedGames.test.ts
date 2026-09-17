import { describe, expect, it } from "vitest";
import { getRelatedGames } from "./relatedGames";
import type { CardGame } from "@/domain/games";

function game(id: string, title: string, values: Partial<CardGame> = {}): CardGame {
    return {
        id,
        title,
        imagePath: `/covers/${id}.webp`,
        url: `https://example.com/${id}`,
        url_type: "VIDEO",
        ...values,
    };
}

describe("getRelatedGames", () => {
    const target = game("target", "Target", { genres: [1], platform: 1, duration: "10:00:00" });

    it("uses tier rank to break ties between equivalent candidates", () => {
        const good = game("good", "Zulu", { genres: [1] });
        const masterpiece = game("masterpiece", "Alpha", { genres: [1] });

        expect(getRelatedGames(target, [good, masterpiece], {
            tierMap: { good: "tier_good", masterpiece: "tier_masterpiece" },
        }).map(({ game: result }) => result.id)).toEqual(["masterpiece", "good"]);
    });

    it("puts the immediate previous and next series games first", () => {
        const candidates = [
            game("previous", "Previous", { genres: [1] }),
            game("next", "Next", { genres: [1] }),
            game("distant", "Distant", { genres: [1] }),
            game("other", "Other", { genres: [1], platform: 1 }),
        ];
        const seriesMap = {
            target: { id: "series", order: 3 },
            previous: { id: "series", order: 2 },
            next: { id: "series", order: 4 },
            distant: { id: "series", order: 10 },
        };

        expect(getRelatedGames(target, candidates, { seriesMap, limit: 3 })
            .map(({ game: result }) => result.id))
            .toEqual(["next", "previous", "distant"]);
    });

    it("uses configured weights to change the ranking", () => {
        const genreMatch = game("genre", "Genre", { genres: [1] });
        const platformMatch = game("platform", "Platform", { platform: 1 });

        expect(getRelatedGames(target, [genreMatch, platformMatch], {
            weights: { genres: 0, genre: 0, platform: 1_000 },
        }).map(({ game: result }) => result.id)).toEqual(["platform", "genre"]);
    });

    it("selects duplicate candidate ids only once", () => {
        const duplicate = game("same", "Same", { genres: [1] });
        expect(getRelatedGames(target, [duplicate, duplicate])).toHaveLength(1);
    });

    it("is deterministic regardless of candidate input order", () => {
        const candidates = [
            game("z", "Zulu", { genres: [1] }),
            game("a", "Alpha", { genres: [1] }),
            game("p", "Platform", { platform: 1 }),
        ];
        const first = getRelatedGames(target, candidates);
        const second = getRelatedGames(target, [...candidates].reverse());
        expect(second).toEqual(first);
    });

    it("treats an unranked candidate as tier_not_evaluated", () => {
        const unranked = game("unranked", "Alpha", { genres: [1] });
        const bad = game("bad", "Zulu", { genres: [1] });
        expect(getRelatedGames(target, [unranked, bad], { tierMap: { bad: "tier_bad" } })
            .map(({ game: result }) => result.id)).toEqual(["bad", "unranked"]);
    });

    it("does not use tier score alone to recommend an unrelated game", () => {
        const unrelated = game("unrelated", "Unrelated");
        expect(getRelatedGames(target, [unrelated], {
            tierMap: { unrelated: "tier_masterpiece" },
        })).toEqual([]);
    });
});