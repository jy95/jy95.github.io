import { describe, it, expect } from "vitest";
import { parsePageParams, paginate } from "./pagination";
describe("Companies pagination contract", () => {
    it.each(["", "page=0&pageSize=-1", "page=1.5&pageSize=no", "page=9007199254740992&pageSize=Infinity"])("defaults %s", query => {
        expect(parsePageParams(new URLSearchParams(query))).toEqual({ page: 1, pageSize: 12 });
    });
    it("caps page size and accepts safe positive integers", () => {
        expect(parsePageParams(new URLSearchParams("page=2&pageSize=101"))).toEqual({ page: 2, pageSize: 100 });
    });
    it("preserves empty and out-of-range responses", () => {
        expect(paginate([], { page: 1, pageSize: 12 })).toEqual({ items: [], page: 1, pageSize: 12, total_items: 0, total_pages: 0 });
        expect(paginate([1, 2, 3], { page: 3, pageSize: 2 })).toEqual({ items: [], page: 3, pageSize: 2, total_items: 3, total_pages: 2 });
    });
});
