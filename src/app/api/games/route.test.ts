import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockGame = {
  title: string;
  platform: number;
  genres: number[];
  releaseDate?: string;
};

type QueryParams = Record<string, string | string[] | undefined>;

// Keep the dataset small and deterministic so each test is easy to reason about.
const mockGames: MockGame[] = [
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

const releasePeriodGames: MockGame[] = [
  { title: "Period lower", platform: 20, genres: [1], releaseDate: "2000-01-01" },
  { title: "Period middle", platform: 20, genres: [1], releaseDate: "2003-06-15" },
  { title: "Period upper", platform: 20, genres: [1], releaseDate: "2005-12-31" },
  { title: "Period before", platform: 20, genres: [1], releaseDate: "1999-12-31" },
  { title: "Period after", platform: 20, genres: [1], releaseDate: "2006-01-01" },
  { title: "Period absent", platform: 20, genres: [1] },
  { title: "Period invalid", platform: 20, genres: [1], releaseDate: "invalid" },
  { title: "Period overflow", platform: 20, genres: [1], releaseDate: "2001-02-29" },
  { title: "Period empty", platform: 20, genres: [1], releaseDate: "" },
  { title: "Period other platform", platform: 21, genres: [1], releaseDate: "2002-01-01" },
  { title: "Period other genre", platform: 20, genres: [2], releaseDate: "2002-01-01" },
  { title: "ZZZZZZZZZZ", platform: 20, genres: [1], releaseDate: "2002-01-01" },
];

// Register mocks before importing the route.
vi.mock("./games.json", () => ({ default: mockGames }));
vi.mock("@/domain/games", () => ({
  buildCardGame: (game: MockGame, base: string) => {
    const slug = game.title.replace(/\s+/g, "-").toLowerCase();

    return {
      ...game,
      id: `id-${slug}`,
      url: `https://www.youtube.com/watch?v=video-${slug}`,
      url_type: "VIDEO",
      imagePath: `${base}/${slug}.jpg`,
    };
  },
}));

import { GET, type ResponseBody } from "./route";

function makeRequest(params: QueryParams = {}): Request {
  const url = new URL("http://localhost/api/games");

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, item));
    } else {
      url.searchParams.set(key, value);
    }
  }

  return new Request(url);
}

async function getGames(params: QueryParams = {}): Promise<ResponseBody> {
  const response = await GET(makeRequest(params));
  return response.json();
}

describe("GET /api/games", () => {
  it("returns all games by default", async () => {
    const data = await getGames();

    expect(data.items.map(item => item.title)).toEqual(mockGames.map(game => game.title));
    expect(data.total_items).toBe(mockGames.length);
    expect(data.total_pages).toBe(1);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(mockGames.length);
    expect(data.filters).toBeUndefined();
  });

  it("filters by platform", async () => {
    const data = await getGames({ platform: "1" });

    expect(data.items.map(item => item.title)).toEqual([
      "Zelda: Breath",
      "Mario Kart",
      "Zelda: Tears",
    ]);
    expect(data.filters).toEqual({ platform: 1 });
  });

  it("matches any of the selected genres", async () => {
    const data = await getGames({ genres: ["1", "2"] });

    expect(data.items.map(item => item.title)).toEqual(["Mario Kart", "Sonic Adventure"]);
    expect(data.filters).toEqual({ genres: [1, 2] });
  });

  it("ignores malformed IDs and removes duplicate genres", async () => {
    const data = await getGames({
      platform: "1oops",
      genres: ["16", "16", "-2", "2oops", "3"],
    });

    expect(data.items.map(item => item.title)).toEqual(["Zelda: Breath", "Zelda: Tears"]);
    expect(data.filters).toEqual({ genres: [3, 16] });
  });

  it("combines platform and genre filters", async () => {
    const data = await getGames({ platform: "1", genres: ["16"] });

    expect(data.items.map(item => item.title)).toEqual(["Zelda: Breath", "Zelda: Tears"]);
  });

  it("includes matching games in fuzzy title search results", async () => {
    const data = await getGames({ title: "Zelda" });
    const titles = data.items.map(item => item.title);

    expect(titles).toEqual(
      expect.arrayContaining(["Zelda: Breath", "Zelda: Tears"]),
    );
  });

  it("ignores an empty title query", async () => {
    const data = await getGames({ title: "" });

    expect(data.total_items).toBe(mockGames.length);
    expect(data.filters).toBeUndefined();
  });

  it("sorts before paginating", async () => {
    const data = await getGames({ sort: "title_asc", pageSize: "3" });

    expect(data.items.map(item => item.title)).toEqual(["Celeste", "Doom", "Halo"]);
    expect(data.filters).toEqual({ sort: "title_asc" });
  });

  it("keeps descending sort order across pages", async () => {
    const first = await getGames({ sort: "title_desc", pageSize: "2", page: "1" });
    const second = await getGames({ sort: "title_desc", pageSize: "2", page: "2" });

    expect(first.items.map(item => item.title)).toEqual(["Zelda: Tears", "Zelda: Breath"]);
    expect(second.items.map(item => item.title)).toEqual(["Undertale", "Terraria"]);
  });

  it("sorts the filtered results", async () => {
    const data = await getGames({ platform: "1", sort: "title_asc" });

    expect(data.items.map(item => item.title)).toEqual([
      "Mario Kart",
      "Zelda: Breath",
      "Zelda: Tears",
    ]);
  });

  it("ignores an unsupported sort value", async () => {
    const data = await getGames({ sort: "bogus" });

    expect(data.items.map(item => item.title)).toEqual(mockGames.map(game => game.title));
    expect(data.filters).toBeUndefined();
  });

  it("returns the requested page without repeating items", async () => {
    const first = await getGames({ pageSize: "5", page: "1" });
    const second = await getGames({ pageSize: "5", page: "2" });
    const ids = [...first.items, ...second.items].map(item => item.id);

    expect(first.items).toHaveLength(5);
    expect(second.items).toHaveLength(5);
    expect(first.page).toBe(1);
    expect(second.page).toBe(2);
    expect(first.pageSize).toBe(5);
    expect(first.total_pages).toBe(Math.ceil(mockGames.length / 5));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("paginates within the filtered results", async () => {
    const first = await getGames({ platform: "1", pageSize: "2", page: "1" });
    const second = await getGames({ platform: "1", pageSize: "2", page: "2" });

    expect(first.total_items).toBe(3);
    expect(first.total_pages).toBe(2);
    expect(first.items.map(item => item.title)).toEqual(["Zelda: Breath", "Mario Kart"]);
    expect(second.items.map(item => item.title)).toEqual(["Zelda: Tears"]);
  });

  it("returns no items for a page beyond the last page", async () => {
    const page = Math.ceil(mockGames.length / 5) + 5;
    const data = await getGames({ pageSize: "5", page: String(page) });

    expect(data.items).toHaveLength(0);
    expect(data.total_items).toBe(mockGames.length);
  });

  it("sets a long-lived Cache-Control header", async () => {
    const response = await GET(makeRequest());

    expect(response.headers.get("Cache-Control")).toContain("max-age=86400");
  });

  it("builds valid card fields for every game", async () => {
    const data = await getGames({ pageSize: "10" });

    for (const item of data.items) {
      expect(item.url).toMatch(/^https:\/\/www\.youtube\.com\//);
      expect(item.url_type).toBe("VIDEO");
      expect(item.imagePath).toMatch(/^\/covers\//);
    }
  });

  it("returns an empty result for an unknown platform", async () => {
    const data = await getGames({ platform: "999" });

    expect(data.items).toHaveLength(0);
    expect(data.total_items).toBe(0);
    expect(data.total_pages).toBe(1);
  });
});

describe("release period API filtering", () => {
  const filters = {
    title: "Period",
    platform: "20",
    genres: ["1"],
    releaseDateFrom: "2000",
    releaseDateTo: "2005",
    sort: "releaseDate_asc",
  };
  let originalLength: number;

  beforeEach(() => {
    originalLength = mockGames.length;
    mockGames.push(...releasePeriodGames);
  });

  afterEach(() => {
    mockGames.splice(originalLength);
  });

  it("includes both boundary dates and combines all filters", async () => {
    const data = await getGames({ ...filters, pageSize: "10" });

    expect(data.total_items).toBe(3);
    expect(data.items.map(item => item.title)).toEqual([
      "Period lower",
      "Period middle",
      "Period upper",
    ]);
  });

  it("paginates the filtered results", async () => {
    const first = await getGames({ ...filters, pageSize: "2" });
    const second = await getGames({ ...filters, pageSize: "2", page: "2" });

    expect(first.total_items).toBe(3);
    expect(first.items.map(item => item.title)).toEqual(["Period lower", "Period middle"]);
    expect(second.items.map(item => item.title)).toEqual(["Period upper"]);
  });

  it("supports a period limited to one year", async () => {
    const data = await getGames({ ...filters, releaseDateTo: "2000", pageSize: "10" });

    expect(data.items.map(item => item.title)).toEqual(["Period lower"]);
  });

  it("does not exclude missing or invalid dates when no date filter is set", async () => {
    const data = await getGames({ title: "Period", platform: "20" });
    const titles = data.items.map(item => item.title);

    expect(titles).toEqual(expect.arrayContaining(["Period absent", "Period invalid"]));
  });
});