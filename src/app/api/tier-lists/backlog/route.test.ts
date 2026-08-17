import { describe, expect, it, vi } from 'vitest';

const mockBacklogTierList = {
    tier_masterpiece: [{ id: 'backlog-1', title: 'Backlog Game' }],
    tier_good: [],
};

vi.mock('./backlog.json', () => ({
    default: mockBacklogTierList,
}));

import { GET } from './route';

describe('GET /api/tier-lists/backlog', () => {
    it('returns the backlog tier-list payload unchanged', async () => {
        const response = await GET();

        expect(await response.json()).toEqual(mockBacklogTierList);
    });

    it('preserves populated and empty categories', async () => {
        const response = await GET();
        const data = await response.json();

        expect(data.tier_masterpiece).toEqual([{ id: 'backlog-1', title: 'Backlog Game' }]);
        expect(data.tier_good).toEqual([]);
    });

    it('sets a long-lived Cache-Control header', async () => {
        const response = await GET();

        expect(response.headers.get('Cache-Control')).toContain('max-age=86400');
        expect(response.headers.get('Cache-Control')).toContain('must-revalidate');
    });
});
