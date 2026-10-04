import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Run after npm run build: node scripts/selection-route-smoke.mjs
// Exercise the built Next.js renderer and real RSC serialization in process.
// Next's request/response mocks replace only the network transport; middleware
// and browser hydration are outside this check. Interactions have Vitest coverage.
const require = createRequire(import.meta.url);
const NextServer = require('next/dist/server/next-server').default;
const { createRequestResponseMocks } = require('next/dist/server/lib/mock-request');
const dir = process.cwd();
const { config } = JSON.parse(readFileSync(resolve(dir, '.next/required-server-files.json'), 'utf8'));
const server = new NextServer({ dir, conf: config, dev: false, hostname: 'localhost', port: 3000, minimalMode: true });
const routes = [
    '/fr/selection',
    '/en/selection',
    '/en/selection?entries=invalid',
    '/en/games',
    '/en/companies',
    '/en/backlog',
    '/en/tier/backlog',
    '/en/tier/games',
    '/en/tier/tests',
];

try {
    const handler = server.getRequestHandler();
    for (const route of routes) {
        for (const rsc of [false, true]) {
            let body = '';
            const { req, res } = createRequestResponseMocks({
                url: route,
                headers: { host: 'localhost:3000', 'x-next-intl-locale': route.split('/')[1], ...(rsc ? { rsc: '1' } : {}) },
                resWriter: chunk => { body += chunk.toString(); return true; },
            });
            await handler(req, res);
            const label = `${rsc ? 'RSC' : 'HTML'} ${route}`;
            assert.equal(res.statusCode, 200, `${label}: ${body.slice(0, 500)}`);
            assert.ok(res.finished && body.length > 500, `${label}: incomplete response`);
            assert.match(res.getHeader('content-type') ?? '', rsc ? /text\/x-component/ : /text\/html/, label);
            assert.doesNotMatch(body, /(?:^|\n|\\n)[\da-f]+:E\{/m, `${label}: server component error`);
            assert.doesNotMatch(body, /Event handlers cannot be passed|Functions cannot be passed directly/, label);
            console.log(`PASS ${label}`);
        }
    }
} finally {
    await server.close();
}
