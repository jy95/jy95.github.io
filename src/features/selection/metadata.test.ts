import { describe, expect, it, vi } from 'vitest';
vi.mock('next-intl/navigation', () => import('@/test/mocks/metadataNavigation'));
import { selectionMetadata } from './metadata';

describe('selection metadata policy', () => {
    it.each(['en', 'fr'])('distinguishes browser-local and shared links (%s)', locale => {
        const own = selectionMetadata(locale, undefined);
        const shared = selectionMetadata(locale, 'abc_-123');
        expect(own.title).not.toEqual(shared.title);
        expect(own.robots).toEqual({ index: false, follow: true });
        expect(shared.robots).toEqual(own.robots);
        expect(shared.alternates?.canonical).toBe(`${locale === 'en' ? '/en' : ''}/selection?entries=abc_-123`);
        expect(shared.openGraph).toMatchObject({ url: expect.stringContaining('entries=abc_-123') });
        expect(JSON.stringify([shared.title, shared.description, shared.openGraph?.images])).not.toContain('abc_-123');
    });
    it.each(['', '%invalid<>', 'x'.repeat(20000), ['first', 'second']])('keeps untrusted payloads out of metadata text', entries => {
        const metadata = selectionMetadata('en', entries);
        expect(metadata.robots).toEqual({ index: false, follow: true });
        expect(metadata.title).toBe('Shared GamesPassionFR Selection');
        const canonical = new URL(String(metadata.alternates?.canonical), 'https://example.com');
        expect(canonical.searchParams.getAll('entries')).toEqual(typeof entries === 'string' ? [entries] : entries);
    });
});
