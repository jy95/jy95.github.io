import { describe, expect, it, vi } from 'vitest';
vi.mock('next-intl/navigation', () => import('@/test/mocks/metadataNavigation'));
import { getSiteUrl } from '@/lib/siteUrl';
import { defaultMetadata } from './defaultMetadata';
import { pageMetadata, withBrand } from './metadata';
import { staticSectionMetadata } from './staticSectionMetadata';

describe('metadata conventions', () => {
    it('localizes defaults without inheriting a route identity', () => {
        expect(defaultMetadata('en').description).not.toBe(defaultMetadata('fr').description);
        expect(defaultMetadata('de')).toEqual(defaultMetadata('fr'));
        expect(defaultMetadata('en').openGraph).toBeUndefined();
        expect(defaultMetadata('en').alternates?.canonical).toBeUndefined();
        expect(new URL(String(defaultMetadata('en').metadataBase)).origin).toBe(new URL(getSiteUrl()).origin);
    });
    it('does not duplicate branding', () => {
        expect(withBrand('GamesPassionFR')).toBe('GamesPassionFR');
        expect(withBrand('Games | GamesPassionFR')).toBe('Games | GamesPassionFR');
    });
    it('uses actual listing paths, feed links and absolute social URLs', () => {
        const metadata = staticSectionMetadata('en', 'dlcs');
        expect(metadata.alternates).toMatchObject({ canonical: '/en/games/dlcs', languages: { fr: '/games/dlcs', en: '/en/games/dlcs' } });
        expect(metadata.openGraph).toMatchObject({ url: `${getSiteUrl()}/en/games/dlcs` });
    });
    it('encodes Unicode image subjects and provides an image without artwork', () => {
        const metadata = pageMetadata({ locale: 'fr', title: 'Été & <星>', description: 'Description', pathnameFor: () => '/games' });
        expect(metadata.openGraph?.images).toEqual([expect.objectContaining({ width: 1200, height: 630, alt: 'Été & <星>' })]);
        expect(metadata.openGraph?.images).toEqual([expect.objectContaining({
            url: expect.stringContaining(new URLSearchParams({ title: 'Été & <星>' }).toString()),
        })]);
        expect(JSON.stringify(metadata.openGraph?.images)).not.toContain('artwork=');
    });
});
