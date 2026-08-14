import { describe, it, expect, vi } from "vitest";

// -- Mock data and module mocks must be set up before importing the module under test --

// Deterministic mock dataset used for all tests
const mockGames = [
  { title: "Zelda: Breath", platform: 1, genres: [16] },
  { title: "Mario Kart", platform: 1, genres: [1, 2] },
  { title: "Sonic Adventure", platform: 2, genres: [2] },
  { title: "Stardew Valley", platform: 3, genres: [4, 5] },
  { title: "Zelda: Tears", platform: 1, genres: [16, 3] },
  { title: "Halo", platform: 4, genres: [6] },
  { title: "Celeste", platform: 3, genres: [4] },
  { title: "Hollow Knight", platform: 3, genres: [4, 7] },
  { title: "Portal", platform: 4, genres: [8] },
  { title: "Undertale", platform: 3, genres: [4, 9] },
  { title: "Doom", platform: 4, genres: [10] },
  { title: "Terraria", platform: 3, genres: [4, 11] },
];

// Mock the JSON import that the route dynamically imports
vi.mock("./games.json", () => {
  return {
    default: mockGames,
  };
});

// For determinism of built card entries, mock buildCardEntry so it returns predictable fields.
// The route imports buildCardEntry from "@/redux/sharedDefintion".
vi.mock("@/redux/sharedDefintion", () => {
  return {
    // runtime: provide a deterministic buildCardEntry
    buildCardEntry: (game: any, base: string) => {
      const safeTitle = String(game.title).replace(/\s+/g, "-").toLowerCase();
      return {
        id: `id-${safeTitle}`,
        url: `https://www.youtube.com/watch?v=video-${safeTitle}`,
        url_type: "VIDEO",
        imagePath: `${base}/${safeTitle}.jpg`,
      };
    },
    // Keep type exports out of runtime mock; TypeScript 'import type' usage is unaffected.
  };
});

// Now import the module under test after mocks are registered
import { GET, type ResponseBody } from "./route";

// Helper to build Request with URL & URLSearchParams (avoids manual string concat)
function makeRequest(params?: Record<string, string | string[] | undefined>): Request {
  const url = new URL("http://localhost/api/games");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          url.searchParams.append(key, String(v));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return new Request(url.toString());
}

// Helper to call the route and parse JSON into ResponseBody
async function callGET(request?: Request): Promise<ResponseBody> {
  const req = request ?? makeRequest();
  const res = await GET(req);
  return res.json();
}

describe("GET /api/games", () => {
  it("returns every game when no filters or pageSize are provided", async () => {
    const data = await callGET();
    expect(data.total_items).toBe(mockGames.length);
    expect(data.items).toHaveLength(mockGames.length);
    expect(data.total_pages).toBe(1);
    expect(data.page).toBe(1);
    expect(data.filters).toBeUndefined();
  });

  it("defaults pageSize to the total number of matching results", async () => {
    const data = await callGET();
    expect(data.pageSize).toBe(mockGames.length);
  });

  it("filters by platform", async () => {
    const req = makeRequest({ selected_platform: "1" });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.length).toBeLessThan(mockGames.length);
    for (const item of data.items) {
      expect(item.platform).toBe(1);
    }
    expect(data.filters).toEqual({ platform: 1, genres: undefined, title: undefined });
  });

  it("filters by multiple genres using OR semantics", async () => {
    const req = makeRequest({ selected_genres: ["1", "2"] });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    for (const item of data.items) {
      expect(item.genres?.some((g) => [1, 2].includes(g))).toBe(true);
    }
    expect(data.filters?.genres).toEqual([1, 2]);
  });

  it("combines platform and genre filters using AND semantics", async () => {
    const req = makeRequest({ selected_platform: "1", selected_genres: ["16"] });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    for (const item of data.items) {
      expect(item.platform).toBe(1);
      expect(item.genres).toContain(16);
    }
  });

  it("fuzzy-searches by title", async () => {
    const req = makeRequest({ selected_title: "Zelda" });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.some((i) => i.title.includes("Zelda"))).toBe(true);
  });

  it("returns no filters object when the title query is an empty string", async () => {
    const req = makeRequest({ selected_title: "" });
    const data = await callGET(req);
    expect(data.filters).toBeUndefined();
    expect(data.total_items).toBe(mockGames.length);
  });

  it("paginates results according to pageSize and page", async () => {
    const req = makeRequest({ pageSize: "5", page: "2" });
    const data = await callGET(req);
    expect(data.items).toHaveLength(5);
    expect(data.pageSize).toBe(5);
    expect(data.page).toBe(2);
    expect(data.total_pages).toBe(Math.ceil(mockGames.length / 5));
  });

  it("returns a different slice of items for consecutive pages", async () => {
    const page1 = await callGET(makeRequest({ pageSize: "5", page: "1" }));
    const page2 = await callGET(makeRequest({ pageSize: "5", page: "2" }));
    const idsPage1 = page1.items.map((i) => i.id);
    const idsPage2 = page2.items.map((i) => i.id);
    expect(idsPage1).not.toEqual(idsPage2);
  });

  it("returns an empty items array for a page beyond the last page", async () => {
    const farPage = Math.ceil(mockGames.length / 5) + 5;
    const data = await callGET(makeRequest({ pageSize: "5", page: String(farPage) }));
    expect(data.items).toHaveLength(0);
    expect(data.total_items).toBe(mockGames.length);
  });

  it("sets a long-lived Cache-Control header", async () => {
    const res = await GET(makeRequest());
    expect(res.headers.get("Cache-Control")).toContain("max-age=86400");
  });

  it("builds a valid card entry (url, url_type, imagePath) for every item", async () => {
    const data = await callGET(makeRequest({ pageSize: "10" }));
    for (const item of data.items) {
      expect(["PLAYLIST", "VIDEO"]).toContain(item.url_type);
      expect(item.url).toMatch(/^https:\/\/www\.youtube\.com\//);
      expect(item.imagePath.startsWith("/covers/")).toBe(true);
    }
  });

  it("returns no results for a platform with no matching games", async () => {
    const data = await callGET(makeRequest({ selected_platform: "999" }));
    expect(data.items).toHaveLength(0);
    expect(data.total_items).toBe(0);
    // route treats non-positive pageSize as a single (empty) page
    expect(data.total_pages).toBe(1);
  });
});
