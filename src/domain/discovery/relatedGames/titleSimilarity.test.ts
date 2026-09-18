import { describe, expect, it } from "vitest";
import { diceCoefficient, titleBigrams } from "./titleSimilarity";

describe("titleBigrams", () => {
    it("normalizes punctuation, case, and repeated whitespace", () => {
        expect(titleBigrams("GAME!!!   ALPHA")).toEqual(titleBigrams("game alpha"));
    });

    it("preserves repeated bigrams", () => {
        expect(titleBigrams("aaaa")).toEqual(["aa", "aa", "aa"]);
    });
});

describe("diceCoefficient", () => {
    it("returns one for equivalent normalized titles", () => {
        expect(diceCoefficient(titleBigrams("Game: Alpha"), titleBigrams("game alpha"))).toBe(1);
    });

    it("counts repeated bigrams only as often as they occur on both sides", () => {
        expect(diceCoefficient(["aa", "aa", "aa"], ["aa", "aa"])).toBe(0.8);
    });

    it("returns zero when either title has no bigrams", () => {
        expect(diceCoefficient([], ["ab"])).toBe(0);
        expect(diceCoefficient(["ab"], [])).toBe(0);
    });
});
