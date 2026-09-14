import feed from "../../../public/feed.json";

export const MAX_RECENT_FEED_ITEMS = 5;

interface FeedItem {
    title: string;
    url?: string;
}

interface JsonFeed {
    items: readonly FeedItem[];
}

export function buildFeeds(data: JsonFeed = feed) {
    const recentItems = data.items.slice(0, MAX_RECENT_FEED_ITEMS);
    const entries = recentItems.map(({title, url}) =>
        `- ${title}${url ? `: ${url}` : ""}`,
    );

    return `## Feeds

- JSON Feed: /feed.json
- RSS Feed: /rss.xml

### Recent entries

Showing up to ${MAX_RECENT_FEED_ITEMS} entries.
${entries.join("\n")}`;
}
