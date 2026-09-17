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

    it("selects other available relation types before additional genre matches", () => {
        const results = getRelatedGames(target, [
            game("genre-a", "Genre A", { genres: [1] }),
            game("genre-b", "Genre B", { genres: [1] }),
            game("platform", "Platform", { platform: 1 }),
            game("duration", "Duration", { duration: "11:00:00" }),
        ]);

        expect(results.map(({ reason }) => reason)).toEqual(["genres", "platform", "duration"]);
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
});
