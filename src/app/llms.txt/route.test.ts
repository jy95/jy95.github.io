import {describe, expect, it, vi} from "vitest";

vi.mock("@/i18n/routing", () => ({
    routing: {
        defaultLocale: "fr",
        pathnames: {
            "/": "/",
            "/new-page": "/new-page",
            "/removed-page": "/removed-page",
            "/video/[id]": "/video/[id]",
            "/playlist/[id]": "/playlist/[id]",
        },
    },
    getPathname: ({href}: {href: string | {pathname: string; params: {id: string}}}) =>
        typeof href === "string" ? href : href.pathname.replace("[id]", href.params.id),
}));

import {buildContentSummary, type CatalogData} from "./content-summary";
import {buildFeeds, MAX_RECENT_FEED_ITEMS} from "./feeds";
import {buildMediaPages, MAX_MEDIA_LINKS_PER_TYPE} from "./media-pages";
import {GET} from "./route";
import {buildSitePages} from "./site-pages";

const emptyTiers = {};

describe("llms.txt", () => {
    it("generates static pages and omits dynamic and removed routes", () => {
        const output = buildSitePages({
            defaultLocale: "fr",
            pathnames: {"/": "/", "/new-page": "/new-page", "/video/[id]": "/video/[id]"},
        }, ({href}) => href);

        expect(output).toContain("- /new-page");
        expect(output).not.toContain("/video/[id]");
        expect(output).not.toContain("/removed-page");
    });

    it("generates bounded video and playlist paths from identifiers", () => {
        const identifiers = Array.from({length: MAX_MEDIA_LINKS_PER_TYPE + 1}, (_, index) => ({
            videoId: `video-${index}`,
            playlistId: `playlist-${index}`,
        }));
        const output = buildMediaPages(identifiers);

        expect(output).toContain(`/video/video-0`);
        expect(output).toContain(`/playlist/playlist-0`);
        expect(output).toContain(`${identifiers.length} total`);
        expect(output).not.toContain(`/video/video-${MAX_MEDIA_LINKS_PER_TYPE}`);
        expect(output).not.toContain(`/playlist/playlist-${MAX_MEDIA_LINKS_PER_TYPE}`);
    });

    it("reflects current catalog totals", () => {
        const data: CatalogData = {
            games: [{}, {}], tests: [{}], backlog: [{}, {}, {}], planning: [{}, {}],
            gameTiers: {good: [{}, {}]}, backlogTiers: {good: [{}]}, testTiers: emptyTiers,
        };
        const output = buildContentSummary(data);

        expect(output).toContain("Published games: 2");
        expect(output).toContain("Backlog candidates: 3");
        expect(output).toContain("Ranked games: 2");
    });

    it("includes feed URLs and only the bounded recent source entries", () => {
        const items = Array.from({length: MAX_RECENT_FEED_ITEMS + 1}, (_, index) => ({
            title: `Entry ${index}`,
            url: `https://example.com/${index}`,
        }));
        const output = buildFeeds({items});

        expect(output).toContain("/feed.json");
        expect(output).toContain("/rss.xml");
        expect(output).toContain("Entry 0: https://example.com/0");
        expect(output).not.toContain(`Entry ${MAX_RECENT_FEED_ITEMS}`);
        expect(buildFeeds({items: items.slice(1)})).not.toContain("Entry 0");
    });

    it("serves the composed document as plain text", async () => {
        const response = await GET();
        const output = await response.text();

        expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
        expect(output).toContain("/new-page");
        expect(output).toContain("/feed.json");
        expect(output).toContain("/video/");
    });
});
