import { describe, expect, it } from "vitest";

import { cachedJson } from "./cachedJson";

describe("cachedJson", () => {
    it("preserves Headers values alongside the static cache header", () => {
        const response = cachedJson({}, {
            headers: new Headers({ "X-Custom-Header": "custom-value" })
        });

        expect(response.headers.get("Cache-Control")).toBe("public, max-age=86400, must-revalidate");
        expect(response.headers.get("X-Custom-Header")).toBe("custom-value");
    });

    it("preserves tuple-array header values and response options", () => {
        const response = cachedJson({}, {
            headers: [["X-Custom-Header", "custom-value"]],
            status: 201
        });

        expect(response.headers.get("X-Custom-Header")).toBe("custom-value");
        expect(response.status).toBe(201);
    });

    it("allows caller headers to override a static default", () => {
        const response = cachedJson({}, {
            headers: new Headers({ "Cache-Control": "no-store" })
        });

        expect(response.headers.get("Cache-Control")).toBe("no-store");
    });
});
