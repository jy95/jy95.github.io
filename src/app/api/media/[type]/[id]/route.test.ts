import { GET } from './route';
import { describe, expect, it } from 'vitest';

describe('media title API', () => {
    for (const { type, id, title } of [
        { type: 'video', id: 'RMgDUMubFsM', title: 'Nova Drift' },
        { type: 'video', id: 'FO8cYct2Bkw', title: 'Batman: Arkham Knight - Red Hood Story Pack' },
        { type: 'playlist', id: 'PLRfhDHeBTBJ7MU5DX4P_oBIRN457ah9lA', title: '-KLAUS-' },
    ]) {
        it(`returns the ${type} title for ${id}`, async () => {
            const response = await GET(new Request(`http://localhost/api/media/${type}/${id}`), {
                params: Promise.resolve({ type, id }),
            });
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ title });
        });
    }

    it('returns 404 for unknown IDs and media types', async () => {
        for (const [type, id] of [['video', 'missing-id'], ['playlist', 'missing-id'], ['other', 'RMgDUMubFsM']]) {
            const response = await GET(new Request(`http://localhost/api/media/${type}/${id}`), {
                params: Promise.resolve({ type, id }),
            });
            expect(response.status).toBe(404);
        }
    });
});
