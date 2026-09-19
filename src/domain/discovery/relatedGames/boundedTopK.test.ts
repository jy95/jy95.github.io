import { describe, expect, it } from "vitest";
import { BoundedTopK } from "./boundedTopK";

import type { RelatedGameResult } from "./types";

function result(score: number, imagePath = "/covers/original.webp"): RelatedGameResult {
    return {
        game: {
            id: "same-game",
            title: "Same Game",
            imagePath,
            url: "https://example.com/same-game",
            url_type: "VIDEO",
        },
        score,
    };
}

describe("BoundedTopK", () => {
    it("replaces a duplicate game with its higher-scoring result", () => {
        const topK = new BoundedTopK(3);
        const original = result(10);
        const higherScoring = result(20, "/covers/higher-scoring.webp");

        topK.add(original);
        topK.add(higherScoring);

        expect(topK.toArray()).toEqual([higherScoring]);
    });

    it("retains the original result when duplicates have equal or lower scores", () => {
        const topK = new BoundedTopK(3);
        const original = result(10);

        topK.add(original);
        topK.add(result(10, "/covers/equal-scoring.webp"));
        topK.add(result(5, "/covers/lower-scoring.webp"));

        expect(topK.toArray()).toEqual([original]);
        expect(topK.toArray()).toHaveLength(1);
    });
});
