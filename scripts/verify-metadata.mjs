import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

// Exercise the real HTTP response, not a simulation of Next's metadata merging.
// Run after npm run build, or pass --dev for a development-server check.
const port = 3100;
const origin = `http://127.0.0.1:${port}`;
const site = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'jy95.github.io'}`;
const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const published = await readJson('src/app/api/games/games.json');
const playlist = published.find(game => game.playlistId);
const video = published.find(game => game.videoId);
const [dlc] = await readJson('src/app/api/dlcs/dlcs.json');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next',
    process.argv.includes('--dev') ? 'dev' : 'start', '--hostname', '127.0.0.1', '--port', String(port)],
{ stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', chunk => { logs += chunk; });
server.stderr.on('data', chunk => { logs += chunk; });
const meta = (document, property) => document.head.querySelector(`meta[property="${property}"]`)?.content;
async function request(path) {
    const response = await fetch(`${origin}${path}`, {
        headers: { 'user-agent': 'facebookexternalhit/1.1' }, redirect: 'manual', signal: AbortSignal.timeout(30000),
    });
    const document = new JSDOM(await response.text()).window.document;
    assert.equal(document.querySelectorAll('meta[name^="twitter:"], meta[property^="twitter:"]').length, 0, path);
    assert.equal(document.body.querySelectorAll('meta[property^="og:"]').length, 0, `${path}: OG must be in head`);
    assert.notEqual(response.headers.get('x-robots-tag'), 'index, follow', path);
    return { response, document };
}
try {
    for (let attempt = 0; ; attempt++) {
        try {
            await fetch(`${origin}/icon.svg`, { signal: AbortSignal.timeout(2000) });
            break;
        } catch (error) {
            if (attempt >= 60 || server.exitCode !== null) throw new Error(`Server unavailable: ${logs}`, { cause: error });
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    for (const locale of ['fr', 'en']) {
        const messages = await readJson(`messages/${locale}.json`);
        const prefix = locale === 'en' ? '/en' : '';
        const routes = [
            [`${prefix}/games`, messages.pageMetadata.games.title, messages.pageMetadata.games.description],
            [`${prefix}/companies/1`], [`${prefix}/games/series/1`], [`${prefix}/games/dlcs/${dlc.id}`],
            [`/${locale}/games/detail/${playlist.playlistId}`, playlist.title],
            [`${prefix}/playlist/${playlist.playlistId}`, playlist.title,
                messages.detailMetadata.watch.playlist.replace('{title}', playlist.title)],
            [`${prefix}/video/${video.videoId}`, video.title,
                messages.detailMetadata.watch.video.replace('{title}', video.title)],
            [`${prefix}/games/random`, messages.pageMetadata.random.title, messages.pageMetadata.random.description],
        ];
        for (const [path, title, description] of routes) {
            const { response, document } = await request(path);
            assert.equal(response.status, 200, path);
            assert.equal(document.head.querySelectorAll('meta[property="og:title"]').length, 1, path);
            if (title) {
                assert.equal(document.title, `${title} | GamesPassionFR`, path);
                assert.equal(meta(document, 'og:title'), `${title} | GamesPassionFR`, path);
            }
            if (description) {
                assert.equal(document.head.querySelector('meta[name="description"]')?.content, description, path);
                assert.equal(meta(document, 'og:description'), description, path);
            }
            assert.equal(meta(document, 'og:url'), `${site}${path}`, path);
            assert.equal(meta(document, 'og:locale'), locale === 'en' ? 'en_US' : 'fr_FR', path);
            assert.equal(document.head.querySelector('link[rel="canonical"]')?.href, `${site}${path}`, path);
            for (const language of ['fr', 'en']) {
                const unprefixed = path.replace(/^\/(fr|en)(?=\/)/, '');
                const languagePath = path.includes('/games/detail/') ? `/${language}${unprefixed}`
                    : `${language === 'en' ? '/en' : ''}${unprefixed}`;
                assert.equal(document.head.querySelector(`link[hreflang="${language}"]`)?.href, `${site}${languagePath}`, path);
            }
            for (const type of ['application/rss+xml', 'application/feed+json']) {
                assert.equal(document.head.querySelector(`link[type="${type}"]`)?.href,
                    `${site}/${type === 'application/rss+xml' ? 'rss.xml' : 'feed.json'}`, path);
            }
            const image = meta(document, 'og:image');
            if (image) {
                const asset = await fetch(`${origin}${new URL(image).pathname}`);
                assert.equal(asset.status, 200, image);
                assert.equal(asset.headers.get('content-type')?.split(';')[0], meta(document, 'og:image:type'), image);
                const properties = await sharp(Buffer.from(await asset.arrayBuffer())).metadata();
                assert.equal(meta(document, 'og:image:width'), String(properties.width));
                assert.equal(meta(document, 'og:image:height'), String(properties.height));
                assert.equal(meta(document, 'og:image:type'), `image/${properties.format}`);
                assert.ok(meta(document, 'og:image:alt'));
            }
            if (path.endsWith('/random')) assert.match(document.head.querySelector('meta[name="robots"]')?.content ?? '', /noindex/);
            console.log(`PASS ${path} (head, localization, canonical, feeds, image, no Twitter)`);
        }
        for (const path of [`${prefix}/tier`, prefix || '/']) {
            const { response } = await request(path);
            assert.equal(response.status, 307, path);
            assert.equal(response.headers.get('location'), `${prefix}${path.endsWith('/tier') ? '/tier/games' : '/games'}`);
            console.log(`PASS redirect ${path}`);
        }
        for (const path of [`/${locale}/games/detail/missing-metadata-record`, `${prefix}/companies/missing-metadata-record`, `${prefix}/video/missing-metadata-record`]) {
            const { document } = await request(path);
            assert.match(document.querySelector('meta[name="robots"]')?.content ?? '', /noindex/, path);
            assert.equal(meta(document, 'og:image'), undefined, path);
            console.log(`PASS missing ${path}`);
        }
    }
} catch (error) {
    console.error(logs);
    throw error;
} finally {
    if (server.exitCode === null) {
        server.kill('SIGTERM');
        await once(server, 'exit');
    }
}
