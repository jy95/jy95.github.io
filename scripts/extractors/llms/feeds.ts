import { renderSection, renderBulletList } from "./markdown";

export const renderFeeds = (): string => renderSection("Feeds", renderBulletList([
    "Sitemap: /sitemap.xml",
    "JSON Feed: /feed.json",
    "RSS Feed: /rss.xml",
]));