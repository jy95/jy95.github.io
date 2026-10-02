import { describe, it, expect, vi } from 'vitest';
import type { SelectionEntry } from '@/features/selection/catalogue';

const catalogue: SelectionEntry[] = [{
    selectionId: '42', category: 'backlog', source: 'backlog',
    game: { id: '42', title: 'Waiting', imagePath: '/cover.webp' },
}];

vi.mock('@/features/selection/catalogue', () => ({
    loadSelectionCatalogue: vi.fn(),
}));

import { loadSelectionCatalogue } from '@/features/selection/catalogue';
import { GET } from './route';

afterEach(() => vi.resetAllMocks());

describe('GET /api/selection', () => {
    it('returns the catalogue with a long-lived Cache-Control header', async () => {
        vi.mocked(loadSelectionCatalogue).mockResolvedValue(catalogue);
        const res = await GET();
        expect(await res.json()).toEqual(catalogue);
        expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    });

    it('propagates catalogue loading failures', async () => {
        vi.mocked(loadSelectionCatalogue).mockRejectedValue(new Error('catalogue failed'));
        await expect(GET()).rejects.toThrow('catalogue failed');
    });
});
