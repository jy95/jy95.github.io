import { writeFile } from "fs/promises";
import { Feed } from "feed";

import type { Database } from "better-sqlite3";
import type { PastGameRow } from "./common/types";

/**
 * Extracts latest games from the database and saves them to a file.
 */
export async function extractAndSavePastGamesToFeeds(db: Database, rssPath: string, jsonFeedPath: string): Promise<void> {
    const extractGamesList = db.prepare("SELECT * FROM games_in_past ORDER BY availableAt DESC, endAt DESC LIMIT 15");
    const gamesList = extractGamesList.all() as PastGameRow[];

    // Create RSS feed
    const feed = new Feed({
        id: "yt:channel:G0N7IV-C43AM9psxslejCQ",
        title: "GamesPassionFR - New Games",
        description: "Feed for new games featured on the GamesPassionFR YouTube channel",
        link: "https://www.youtube.com/@GPFR1",
        language: "en",
        image: "https://yt3.ggpht.com/GucDvaNg4zIpDmSQPj2BkvgrMdHQxrelheCbwmK00G0k1IfHJuWJt5OVa6656uZ9G-G1BFmN=s176-c-k-c0x00ffffff-no-rj",
        author: {
            name: "GamesPassionFR",
            link: "http://jy95.github.io/"
        },
        feedLinks: {
            atom: "https://jy95.github.io/rss.xml",
            json: "https://jy95.github.io/feed.json"
        }
    });

    // Add YouTube RSS feed url
    feed.addExtension({
        name: 'channelFeed',
        objects: {
            "link": "https://www.youtube.com/feeds/videos.xml?channel_id=UCG0N7IV-C43AM9psxslejCQ"
        }
    })

    // Create entries
    for (const game of gamesList) {
        const identifier = game.playlistId ?? game.videoId;
        const url = game.playlistId 
            ? `https://www.youtube.com/playlist?list=${game.playlistId}` 
            : `https://www.youtube.com/watch?v=${game.videoId}`;
        const image = `https://raw.githubusercontent.com/jy95/jy95.github.io/refs/heads/master/public/covers/${identifier}/cover.webp`;

        feed.addItem({
            title: game.title,
            id: `yt:${identifier}`,
            link: url,
            image: image,
            content: url,
            date: new Date(game.availableAt)
        });
    }

    await writeFile(
        rssPath,
        feed.rss2(),
        "utf-8"
    );
    console.log(`${rssPath} successfully written`);

    await writeFile(
        jsonFeedPath,
        feed.json1(),
        "utf-8"
    );
    console.log(`${jsonFeedPath} successfully written`);
}