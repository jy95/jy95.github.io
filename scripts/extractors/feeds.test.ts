import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { openTestDb, hasRealDb } from '../tasks/testDbHelper';
import { tempOutputPath } from './common/testFileHelper';
import { extractAndSavePastGamesToFeeds } from './feeds';
import type { Database } from 'better-sqlite3';

describe.skipIf(!hasRealDb)('extractAndSavePastGamesToFeeds', () => {
    let db: Database;
    let cleanupDb: () => void;
    let rssPath: string;
    let cleanupRss: () => void;
    let jsonFeedPath: string;
    let cleanupJsonFeed: () => void;

    beforeEach(() => {
        ({ db, cleanup: cleanupDb } = openTestDb() as any);
        ({ path: rssPath, cleanup: cleanupRss } = tempOutputPath('feed', 'xml'));
        ({ path: jsonFeedPath, cleanup: cleanupJsonFeed } = tempOutputPath('feed', 'json'));
    });
    afterEach(() => {
        cleanupDb();
        cleanupRss();
        cleanupJsonFeed();
    });

    it('writes a valid RSS 2.0 document with the channel title', async () => {
        await extractAndSavePastGamesToFeeds(db, rssPath, jsonFeedPath);
        const rss = await readFile(rssPath, 'utf-8');

        expect(rss).toContain('<rss');
        expect(rss).toContain('GamesPassionFR - New Games');
    });

    it('writes a JSON Feed document that parses and has an items array', async () => {
        await extractAndSavePastGamesToFeeds(db, rssPath, jsonFeedPath);
        const jsonFeed = JSON.parse(await readFile(jsonFeedPath, 'utf-8'));

        expect(Array.isArray(jsonFeed.items)).toBe(true);
    });

    it('never includes more than 15 items, matching the extractor\'s LIMIT clause', async () => {
        await extractAndSavePastGamesToFeeds(db, rssPath, jsonFeedPath);
        const jsonFeed = JSON.parse(await readFile(jsonFeedPath, 'utf-8'));

        expect(jsonFeed.items.length).toBeLessThanOrEqual(15);
    });

    it('the item count matches min(15, total games_in_past rows)', async () => {
        const totalPast = db.prepare('SELECT COUNT(*) AS n FROM games_in_past').get() as { n: number };
        const expected = Math.min(15, totalPast.n);

        await extractAndSavePastGamesToFeeds(db, rssPath, jsonFeedPath);
        const jsonFeed = JSON.parse(await readFile(jsonFeedPath, 'utf-8'));

        expect(jsonFeed.items.length).toBe(expected);
    });

    it('every RSS/JSON feed item links to a valid YouTube watch or playlist URL', async () => {
        await extractAndSavePastGamesToFeeds(db, rssPath, jsonFeedPath);
        const jsonFeed = JSON.parse(await readFile(jsonFeedPath, 'utf-8'));

        for (const item of jsonFeed.items) {
            expect(item.url).toMatch(/^https:\/\/www\.youtube\.com\/(watch\?v=|playlist\?list=)/);
        }
    });
});