import { describe, expect, it } from 'vitest';
import { buildQueryUrl, infinitePaginationOptions } from './pagination';

describe('infinite pagination helpers', () => {
    const options = infinitePaginationOptions<{ total_pages: number }>();
    it('starts at page one', () => expect(options.initialPageParam).toBe(1));
    it.each([[1, 3, 2], [2, 3, 3], [3, 3, undefined], [1, 0, undefined], [5, 3, undefined]])(
        'advances page %s with %s total pages', (page, total, expected) => {
            expect(options.getNextPageParam({ total_pages: total }, [], page)).toBe(expected);
        });
    it('encodes scalar parameters without losing reserved characters', () => {
        const url = new URL(buildQueryUrl('/series', { filter: 'A & B/é?', sort: 'nameAsc', page: 2, pageSize: 12, enabled: false }), 'https://example.com');
        expect(Object.fromEntries(url.searchParams)).toEqual({ filter: 'A & B/é?', sort: 'nameAsc', page: '2', pageSize: '12', enabled: 'false' });
    });
    it('retains company-specific roles', () => {
        expect(buildQueryUrl('/companies', { role: 'publisher', sort: 'countDesc', page: 1, pageSize: 12 }))
            .toBe('/companies?role=publisher&sort=countDesc&page=1&pageSize=12');
    });
});
