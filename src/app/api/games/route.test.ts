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

// For determinism of built card entries, mock buildCardGame so it returns predictable fields.
// The route imports buildCardGame from "@/domain/games" (the canonical domain module).
vi.mock("@/domain/games", () => {
  return {
    // runtime: provide a deterministic buildCardGame
    buildCardGame: (game: any, base: string) => {
      const safeTitle = String(game.title).replace(/\s+/g, "-").toLowerCase();
      return {
        ...game,
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
    const req = makeRequest({ platform: "1" });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.length).toBeLessThan(mockGames.length);
    for (const item of data.items) {
      expect(item.platform).toBe(1);
    }
    expect(data.filters).toEqual({ platform: 1 });
  });

  it("filters by multiple genres using OR semantics", async () => {
    const req = makeRequest({ genres: ["1", "2"] });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    for (const item of data.items) {
      expect(item.genres?.some((g) => [1, 2].includes(g))).toBe(true);
    }
    expect(data.filters?.genres).toEqual([1, 2]);
  });

  it("ignores malformed IDs and canonicalizes repeated genres", async () => {
    const data = await callGET(makeRequest({
      platform: "1oops",
      genres: ["16", "16", "-2", "2oops", "3"],
    }));
    expect(data.filters).toEqual({ genres: [3, 16] });
    expect(data.items.every(item => item.genres?.some(genre => [3, 16].includes(genre)))).toBe(true);
  });

  it("combines platform and genre filters using AND semantics", async () => {
    const req = makeRequest({ platform: "1", genres: ["16"] });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    for (const item of data.items) {
      expect(item.platform).toBe(1);
      expect(item.genres).toContain(16);
    }
  });

  it("fuzzy-searches by title", async () => {
    const req = makeRequest({ title: "Zelda" });
    const data = await callGET(req);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.some((i) => i.title.includes("Zelda"))).toBe(true);
  });

  it("returns no filters object when the title query is an empty string", async () => {
    const req = makeRequest({ title: "" });
    const data = await callGET(req);
    expect(data.filters).toBeUndefined();
    expect(data.total_items).toBe(mockGames.length);
  });

  it("sorts before paginating", async () => {
    const data = await callGET(makeRequest({ sort: "title_asc", pageSize: "3" }));

    expect(data.items.map(i => i.title)).toEqual(["Celeste", "Doom", "Halo"]);
    expect(data.filters).toEqual({ sort: "title_asc" });
  });

  it("sorts descending across pages consistently", async () => {
    const p1 = await callGET(makeRequest({ sort: "title_desc", pageSize: "2", page: "1" }));
    const p2 = await callGET(makeRequest({ sort: "title_desc", pageSize: "2", page: "2" }));

    expect(p1.items.map(i => i.title)).toEqual(["Zelda: Tears", "Zelda: Breath"]);
    expect(p2.items.map(i => i.title)).toEqual(["Undertale", "Terraria"]);
  });

  it("applies sort on top of filters", async () => {
    const data = await callGET(makeRequest({ platform: "1", sort: "title_asc" }));

    expect(data.items.map(i => i.title)).toEqual(["Mario Kart", "Zelda: Breath", "Zelda: Tears"]);
  });

  it("ignores an unsupported sort value", async () => {
    const data = await callGET(makeRequest({ sort: "bogus" }));

    expect(data.items.map(i => i.title)).toEqual(mockGames.map(g => g.title));
    expect(data.filters).toBeUndefined();
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

  it("paginates within the changed filter result", async () => {
    const first = await callGET(makeRequest({ platform: "1", pageSize: "2", page: "1" }));
    const second = await callGET(makeRequest({ platform: "1", pageSize: "2", page: "2" }));
    expect(first.total_items).toBe(3);
    expect(first.total_pages).toBe(2);
    expect(first.items).toHaveLength(2);
    expect(second.items).toHaveLength(1);
    expect(second.items[0].id).not.toBe(first.items[0].id);
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
    const data = await callGET(makeRequest({ platform: "999" }));
    expect(data.items).toHaveLength(0);
    expect(data.total_items).toBe(0);
    // route treats non-positive pageSize as a single (empty) page
    expect(data.total_pages).toBe(1);
  });
});


describe('release period API filtering', () => {
  it('includes both boundary dates and combines with title/platform/genres before pagination', async () => {
    const fixtures = [
      { title: 'Period lower', platform: 20, genres: [1], releaseDate: '2000-01-01' },
      { title: 'Period middle', platform: 20, genres: [1], releaseDate: '2003-06-15' },
      { title: 'Period upper', platform: 20, genres: [1], releaseDate: '2005-12-31' },
      { title: 'Period before', platform: 20, genres: [1], releaseDate: '1999-12-31' },
      { title: 'Period after', platform: 20, genres: [1], releaseDate: '2006-01-01' },
      { title: 'Period absent', platform: 20, genres: [1] },
      { title: 'Period invalid', platform: 20, genres: [1], releaseDate: 'invalid' },
      { title: 'Period overflow', platform: 20, genres: [1], releaseDate: '2001-02-29' },
      { title: 'Period empty', platform: 20, genres: [1], releaseDate: '' },
      { title: 'Period other platform', platform: 21, genres: [1], releaseDate: '2002-01-01' },
      { title: 'Period other genre', platform: 20, genres: [2], releaseDate: '2002-01-01' },
      { title: 'ZZZZZZZZZZ', platform: 20, genres: [1], releaseDate: '2002-01-01' },
    ];
    const originalLength = mockGames.length;
    mockGames.push(...fixtures);
    try {
      const params = { title: 'Period', platform: '20', genres: ['1'], releaseDateFrom: '2000', releaseDateTo: '2005', sort: 'releaseDate_asc', pageSize: '2' };
      const first = await callGET(makeRequest(params));
      const second = await callGET(makeRequest({ ...params, page: '2' }));
      expect(first.total_items).toBe(3);
      expect(first.items.map(game => game.title)).toEqual(['Period lower', 'Period middle']);
      expect(second.items.map(game => game.title)).toEqual(['Period upper']);
      const singleYear = await callGET(makeRequest({ ...params, releaseDateTo: '2000' }));
      expect(singleYear.items.map(game => game.title)).toEqual(['Period lower']);
      const cleared = await callGET(makeRequest({ platform: '20' }));
      expect(cleared.items.map(game => game.title)).toContain('Period absent');
      expect(cleared.items.map(game => game.title)).toContain('Period invalid');
    } finally {
      mockGames.splice(originalLength);
    }
  });
});
