import { GET } from './route';
import { describe, expect, it } from 'vitest';

describe('media metadata API', () => {
    for (const { type, id, title, imagePath } of [
        { type: 'video', id: 'RMgDUMubFsM', title: 'Nova Drift', imagePath: '/testscovers/RMgDUMubFsM/cover.webp' },
        { type: 'video', id: 'FO8cYct2Bkw', title: 'Batman: Arkham Knight - Red Hood Story Pack', imagePath: '/covers/FO8cYct2Bkw/cover.webp' },
        { type: 'playlist', id: 'PLRfhDHeBTBJ7MU5DX4P_oBIRN457ah9lA', title: '-KLAUS-', imagePath: '/covers/PLRfhDHeBTBJ7MU5DX4P_oBIRN457ah9lA/cover.webp' },
    ]) {
        it(`returns the ${type} metadata for ${id}`, async () => {
            const response = await GET(new Request(`https://example.test/api/metadata/${type}/${id}`), {
                params: Promise.resolve({ type, id }),
            });
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ title, imagePath });
        });
    }

    it('returns 404 for unknown IDs and media types', async () => {
        for (const [type, id] of [['video', 'missing-id'], ['playlist', 'missing-id'], ['other', 'RMgDUMubFsM']]) {
            const response = await GET(new Request(`https://example.test/api/metadata/${type}/${id}`), {
                params: Promise.resolve({ type, id }),
            });
            expect(response.status).toBe(404);
        }
    });
});
