import { describe, it, expect, vi } from 'vitest';

vi.mock('@/features/selection/catalogue', () => ({
    loadSelectionCatalogue: async () => [{ selectionId: 'a', category: 'games' }],
}));

import { GET } from './route';

describe('GET /api/selection', () => {
    it('returns the selection catalogue with a long-lived Cache-Control header', async () => {
        const res = await GET();
        expect(await res.json()).toEqual([{ selectionId: 'a', category: 'games' }]);
        expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    });
});