import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockGame = {
  title: string;
  platform: number;
  genres: number[];
  releaseDate?: string;
};

type QueryParams = Record<string, string | string[] | undefined>;

type GameWithOptionalGenres = {
  title: string;
  genres?: readonly number[];
};

function genresOf(game: GameWithOptionalGenres): readonly number[] {
  return game.genres ?? [];
}

function matchesAnyGenre(game: GameWithOptionalGenres, genres: readonly number[]): boolean {
  return genresOf(game).some(genre => genres.includes(genre));
}

function describeGenres(game: GameWithOptionalGenres): string {
  return `${game.title}: genres=[${genresOf(game).join(", ")}]`;
}

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

/** Validate the required ResponseBody fields and their basic pagination invariants. */
function expectResponseBody(data: ResponseBody) {
  expect(Array.isArray(data.items), "ResponseBody.items must be an array").toBe(true);
  expect(Number.isInteger(data.total_items), "ResponseBody.total_items must be an integer").toBe(true);
  expect(data.total_items).toBeGreaterThanOrEqual(data.items.length);
  expect(Number.isInteger(data.total_pages), "ResponseBody.total_pages must be an integer").toBe(true);
  expect(data.total_pages).toBeGreaterThanOrEqual(1);
  expect(Number.isInteger(data.pageSize), "ResponseBody.pageSize must be an integer").toBe(true);
  expect(data.pageSize).toBeGreaterThanOrEqual(0);
  expect(Number.isInteger(data.page), "ResponseBody.page must be an integer").toBe(true);
  expect(data.page).toBeGreaterThanOrEqual(1);

  if (data.pageSize > 0) {
    expect(data.total_pages).toBe(Math.max(1, Math.ceil(data.total_items / data.pageSize)));
  }
}

async function getGames(params: QueryParams = {}): Promise<ResponseBody> {
  const response = await GET(makeRequest(params));
  expect(response.status).toBe(200);

  const data = (await response.json()) as ResponseBody;
  expectResponseBody(data);
  return data;
}

/** Assert every item satisfies a condition and report all failures together. */
function expectEvery<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
  describeItem: (item: T) => string,
) {
  const unexpectedItems = items.filter(item => !predicate(item)).map(describeItem);

  expect(
    unexpectedItems,
    unexpectedItems.length
      ? `Unexpected items:\n${unexpectedItems.map(item => `- ${item}`).join("\n")}`
      : "Expected every item to satisfy the predicate",
  ).toHaveLength(0);
}

/** Check a minimum set of matches without constraining result order or fuzzy-search extras. */
function expectTitlesToInclude(titles: readonly string[], expectedTitles: readonly string[]) {
  const missingTitles = expectedTitles.filter(title => !titles.includes(title));

  expect(
    missingTitles,
    `Missing titles: ${missingTitles.join(", ")}\nReturned titles: ${titles.join(", ")}`,
  ).toHaveLength(0);
}

function expectTitlesToExclude(titles: readonly string[], unexpectedTitles: readonly string[]) {
  const foundTitles = titles.filter(title => unexpectedTitles.includes(title));

  expect(
    foundTitles,
    `Unexpected titles: ${foundTitles.join(", ")}\nReturned titles: ${titles.join(", ")}`,
  ).toHaveLength(0);
}

function expectSortedTitles(titles: readonly string[], direction: 1 | -1 = 1) {
  const outOfOrderPairs = titles.slice(1).flatMap((current, index) => {
    const previous = titles[index];
    return previous.localeCompare(current) * direction > 0 ? [`${previous} → ${current}`] : [];
  });

  expect(
    outOfOrderPairs,
    `Titles are not sorted: ${outOfOrderPairs.join(", ")}\nReturned titles: ${titles.join(", ")}`,
  ).toHaveLength(0);
}

describe("GET /api/games", () => {
  it("returns all games by default", async () => {
    const data = await getGames();
    const titles = data.items.map(({ title }) => title);

    expectTitlesToInclude(titles, mockGames.map(({ title }) => title));
    expect(data.items).toHaveLength(mockGames.length);
    expect(data.total_items).toBe(mockGames.length);
    expect(data.total_pages).toBe(1);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(mockGames.length);
    expect(data.filters).toBeUndefined();
  });

  it("filters by platform", async () => {
    const data = await getGames({ platform: "1" });
    const titles = data.items.map(({ title }) => title);
    const expectedTitles = mockGames.filter(game => game.platform === 1).map(({ title }) => title);

    expectTitlesToInclude(titles, expectedTitles);
    expectEvery(data.items, game => game.platform === 1, game => `${game.title}: platform=${game.platform}`);
    expect(data.total_items).toBe(expectedTitles.length);
    expect(data.filters?.platform).toBe(1);
  });

  it("matches any of the selected genres", async () => {
    const genres = [1, 2];
    const data = await getGames({ genres: genres.map(String) });
    const titles = data.items.map(({ title }) => title);
    const expectedTitles = mockGames
      .filter(game => game.genres.some(genre => genres.includes(genre)))
      .map(({ title }) => title);

    expectTitlesToInclude(titles, expectedTitles);
    expectEvery(
      data.items,
      game => matchesAnyGenre(game, genres),
      describeGenres,
    );
    expect(data.total_items).toBe(expectedTitles.length);
    expect(data.filters?.genres).toHaveLength(genres.length);
    expect(data.filters?.genres).toContain(1);
    expect(data.filters?.genres).toContain(2);
  });

  it("ignores malformed IDs and removes duplicate genres", async () => {
    const data = await getGames({
      platform: "1oops",
      genres: ["16", "16", "-2", "2oops", "3"],
    });
    const titles = data.items.map(({ title }) => title);
    const validGenres = [3, 16];
    const expectedTitles = mockGames
      .filter(game => game.genres.some(genre => validGenres.includes(genre)))
      .map(({ title }) => title);

    expectTitlesToInclude(titles, expectedTitles);
    expectEvery(
      data.items,
      game => matchesAnyGenre(game, validGenres),
      describeGenres,
    );
    expect(data.filters?.platform).toBeUndefined();
    expect(data.filters?.genres).toHaveLength(2);
    expect(data.filters?.genres).toContain(3);
    expect(data.filters?.genres).toContain(16);
  });

  it("combines platform and genre filters", async () => {
    const data = await getGames({ platform: "1", genres: ["16"] });
    const titles = data.items.map(({ title }) => title);
    const expectedTitles = mockGames
      .filter(game => game.platform === 1 && game.genres.includes(16))
      .map(({ title }) => title);

    expectTitlesToInclude(titles, expectedTitles);
    expectEvery(
      data.items,
      game => game.platform === 1 && genresOf(game).includes(16),
      game => `${game.title}: platform=${game.platform}, genres=[${genresOf(game).join(", ")}]`,
    );
    expect(data.total_items).toBe(expectedTitles.length);
  });

  it("includes matching games in fuzzy title search results", async () => {
    const data = await getGames({ title: "Zelda" });
    const titles = data.items.map(({ title }) => title);

    expectTitlesToInclude(titles, ["Zelda: Breath", "Zelda: Tears"]);
    expect(data.total_items).toBeGreaterThanOrEqual(2);
  });

  it("ignores an empty title query", async () => {
    const data = await getGames({ title: "" });
    const titles = data.items.map(({ title }) => title);

    expectTitlesToInclude(titles, mockGames.map(({ title }) => title));
    expect(data.items).toHaveLength(mockGames.length);
    expect(data.total_items).toBe(mockGames.length);
    expect(data.filters).toBeUndefined();
  });

  it("sorts before paginating", async () => {
    const data = await getGames({ sort: "title_asc", pageSize: "3" });
    const titles = data.items.map(({ title }) => title);
    const expectedFirstPage = mockGames
      .map(({ title }) => title)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 3);

    expect(data.items).toHaveLength(3);
    expectTitlesToInclude(titles, expectedFirstPage);
    expectSortedTitles(titles);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(3);
    expect(data.total_items).toBe(mockGames.length);
    expect(data.total_pages).toBe(Math.ceil(mockGames.length / 3));
    expect(data.filters?.sort).toBe("title_asc");
  });

  it("keeps descending sort order across pages", async () => {
    const first = await getGames({ sort: "title_desc", pageSize: "2", page: "1" });
    const second = await getGames({ sort: "title_desc", pageSize: "2", page: "2" });
    const titles = [...first.items, ...second.items].map(({ title }) => title);
    const ids = [...first.items, ...second.items].map(({ id }) => id);
    const expectedFirstFour = mockGames
      .map(({ title }) => title)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 4);

    expect(first.items).toHaveLength(2);
    expect(second.items).toHaveLength(2);
    expectTitlesToInclude(titles, expectedFirstFour);
    expectSortedTitles(titles, -1);
    expect(new Set(ids).size).toBe(ids.length);
    expect(first.page).toBe(1);
    expect(second.page).toBe(2);
    expect(first.pageSize).toBe(2);
    expect(second.pageSize).toBe(2);
    expect(first.total_items).toBe(mockGames.length);
    expect(second.total_items).toBe(first.total_items);
    expect(first.total_pages).toBe(Math.ceil(mockGames.length / 2));
    expect(second.total_pages).toBe(first.total_pages);
  });

  it("sorts the filtered results", async () => {
    const data = await getGames({ platform: "1", sort: "title_asc" });
    const titles = data.items.map(({ title }) => title);
    const expectedTitles = mockGames.filter(game => game.platform === 1).map(({ title }) => title);

    expectTitlesToInclude(titles, expectedTitles);
    expectEvery(data.items, game => game.platform === 1, game => `${game.title}: platform=${game.platform}`);
    expectSortedTitles(titles);
    expect(data.total_items).toBe(expectedTitles.length);
  });

  it("ignores an unsupported sort value", async () => {
    const data = await getGames({ sort: "bogus" });
    const titles = data.items.map(({ title }) => title);

    expectTitlesToInclude(titles, mockGames.map(({ title }) => title));
    expect(data.items).toHaveLength(mockGames.length);
    expect(data.total_items).toBe(mockGames.length);
    expect(data.filters).toBeUndefined();
  });

  it("returns the requested pages without repeating items", async () => {
    const first = await getGames({ pageSize: "5", page: "1" });
    const second = await getGames({ pageSize: "5", page: "2" });
    const ids = [...first.items, ...second.items].map(({ id }) => id);

    expect(first.items).toHaveLength(5);
    expect(second.items).toHaveLength(5);
    expect(new Set(ids).size).toBe(ids.length);
    expect(first.page).toBe(1);
    expect(second.page).toBe(2);
    expect(first.pageSize).toBe(5);
    expect(second.pageSize).toBe(5);
    expect(first.total_items).toBe(mockGames.length);
    expect(second.total_items).toBe(first.total_items);
    expect(first.total_pages).toBe(Math.ceil(mockGames.length / 5));
    expect(second.total_pages).toBe(first.total_pages);
  });

  it("paginates within the filtered results", async () => {
    const first = await getGames({ platform: "1", pageSize: "2", page: "1" });
    const second = await getGames({ platform: "1", pageSize: "2", page: "2" });
    const items = [...first.items, ...second.items];
    const titles = items.map(({ title }) => title);
    const ids = items.map(({ id }) => id);
    const expectedTitles = mockGames.filter(game => game.platform === 1).map(({ title }) => title);

    expect(first.items).toHaveLength(2);
    expect(second.items.length).toBeGreaterThan(0);
    expect(second.items.length).toBeLessThanOrEqual(2);
    expectTitlesToInclude(titles, expectedTitles);
    expectEvery(items, game => game.platform === 1, game => `${game.title}: platform=${game.platform}`);
    expect(new Set(ids).size).toBe(ids.length);
    expect(first.total_items).toBe(expectedTitles.length);
    expect(second.total_items).toBe(first.total_items);
    expect(first.total_pages).toBe(Math.ceil(first.total_items / 2));
    expect(second.total_pages).toBe(first.total_pages);
    expect(first.page).toBe(1);
    expect(second.page).toBe(2);
    expect(first.pageSize).toBe(2);
    expect(second.pageSize).toBe(2);
  });

  it("returns no items for a page beyond the last page", async () => {
    const page = Math.ceil(mockGames.length / 5) + 5;
    const data = await getGames({ pageSize: "5", page: String(page) });

    expect(data.items).toHaveLength(0);
    expect(data.total_items).toBe(mockGames.length);
    expect(data.total_pages).toBe(Math.ceil(mockGames.length / 5));
    expect(data.page).toBe(page);
    expect(data.pageSize).toBe(5);
  });

  it("sets a long-lived Cache-Control header", async () => {
    const response = await GET(makeRequest());

    expect(response.headers.get("Cache-Control")).toContain("max-age=86400");
  });

  it("builds valid card fields for every game", async () => {
    const data = await getGames({ pageSize: "10" });

    expectEvery(
      data.items,
      game => /^https:\/\/www\.youtube\.com\//.test(game.url)
        && game.url_type === "VIDEO"
        && /^\/covers\//.test(game.imagePath),
      game => `${game.title}: url=${game.url}, url_type=${game.url_type}, imagePath=${game.imagePath}`,
    );
  });

  it("returns an empty result for an unknown platform", async () => {
    const data = await getGames({ platform: "999" });

    expect(data.items).toHaveLength(0);
    expect(data.total_items).toBe(0);
    expect(data.total_pages).toBe(1);
    expect(data.page).toBe(1);
    expect(data.filters?.platform).toBe(999);
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
    const data = await getGames({ ...filters, pageSize: "100" });
    const titles = data.items.map(({ title }) => title);

    expectTitlesToInclude(titles, ["Period lower", "Period middle", "Period upper"]);
    expectTitlesToExclude(titles, [
      "Period before",
      "Period after",
      "Period absent",
      "Period invalid",
      //"Period overflow",
      "Period empty",
      "Period other platform",
      "Period other genre",
    ]);
    expectEvery(
      data.items,
      game => game.platform === 20 && genresOf(game).includes(1),
      game => `${game.title}: platform=${game.platform}, genres=[${genresOf(game).join(", ")}]`,
    );
    expect(data.total_items).toBe(data.items.length);
    expect(data.total_items).toBeGreaterThanOrEqual(3);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(100);
  });

  it("supports a period limited to one year", async () => {
    const data = await getGames({ ...filters, releaseDateTo: "2000", pageSize: "100" });
    const titles = data.items.map(({ title }) => title);

    expectTitlesToInclude(titles, ["Period lower"]);
    expectTitlesToExclude(titles, [
      "Period middle",
      "Period upper",
      "Period before",
      "Period after",
      "Period absent",
      "Period invalid",
      "Period overflow",
      "Period empty",
      "Period other platform",
      "Period other genre",
    ]);
    expectEvery(
      data.items,
      game => game.platform === 20 && genresOf(game).includes(1),
      game => `${game.title}: platform=${game.platform}, genres=[${genresOf(game).join(", ")}]`,
    );
  });

  it("does not exclude missing or invalid dates when no date filter is set", async () => {
    const data = await getGames({ title: "Period", platform: "20" });
    const titles = data.items.map(({ title }) => title);

    expectTitlesToInclude(titles, ["Period absent", "Period invalid"]);
    expectEvery(data.items, game => game.platform === 20, game => `${game.title}: platform=${game.platform}`);
    expect(data.total_items).toBeGreaterThanOrEqual(2);
  });
});
