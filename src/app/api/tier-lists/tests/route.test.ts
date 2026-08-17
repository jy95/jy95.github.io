import { describe, expect, it, vi } from 'vitest';

const mockTestsTierList = {
    tier_excellent: [{ id: 'test-1', title: 'Test One' }],
    tier_not_evaluated: [],
};

vi.mock('./tests.json', () => ({
    default: mockTestsTierList,
}));

import { GET } from './route';

describe('GET /api/tier-lists/tests', () => {
    it('returns the tests tier-list payload unchanged', async () => {
        const response = await GET();

        expect(await response.json()).toEqual(mockTestsTierList);
    });

    it('preserves populated and empty categories', async () => {
        const response = await GET();
        const data = await response.json();

        expect(data.tier_excellent).toEqual([{ id: 'test-1', title: 'Test One' }]);
        expect(data.tier_not_evaluated).toEqual([]);
    });

    it('sets a long-lived Cache-Control header', async () => {
        const response = await GET();

        expect(response.headers.get('Cache-Control')).toContain('max-age=86400');
        expect(response.headers.get('Cache-Control')).toContain('must-revalidate');
    });
});
