import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTranslator } from 'next-intl';

import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';

const loaders = vi.hoisted(() => ({ games: vi.fn(), dlcs: vi.fn() }));
vi.mock('@/lib/gamesData', async importOriginal => ({
    ...await importOriginal<typeof import('@/lib/gamesData')>(),
    loadPublishedGames: loaders.games, loadDlcGroups: loaders.dlcs,
}));
vi.mock('@/i18n/routing', () => ({
    routing: { locales: ['fr', 'en'], defaultLocale: 'fr' },
    getPathname: ({ locale, href }: { locale: string; href: { pathname: string; params: { id: string } } }) =>
        `${locale === 'en' ? '/en' : ''}${href.pathname.replace('[id]', href.params.id)}`,
}));
vi.mock('next-intl/server', () => ({
    getTranslations: async ({ locale }: { locale: 'fr' | 'en' }) => createTranslator({
        locale, messages: locale === 'en' ? en : fr, namespace: 'watchMetadata',
    }),
}));

import { generateMetadata as playlistMetadata } from '@/app/[locale]/playlist/[id]/page';
import { generateMetadata as videoMetadata } from '@/app/[locale]/video/[id]/page';

beforeEach(() => {
    loaders.games.mockResolvedValue([{ title: 'Example', playlistId: 'a/b', platform: 1, coverFile: 'custom.webp' }]);
    loaders.dlcs.mockResolvedValue([{ dlcs: [{ title: 'Expansion', videoId: 'video', platform: 1 }] }]);
});

describe('watch route metadata', () => {
    it.each(['fr', 'en'] as const)('uses published playlist content and encoded canonical URLs (%s)', async locale => {
        const metadata = await playlistMetadata({ params: Promise.resolve({ locale, id: 'a/b' }) });
        const path = `${locale === 'en' ? '/en' : ''}/playlist/a%2Fb`;
        expect(metadata.alternates?.canonical).toBe(path);
        expect(metadata.alternates?.languages).toEqual({ fr: '/playlist/a%2Fb', en: '/en/playlist/a%2Fb' });
        expect(metadata.openGraph).toMatchObject({
            url: path, locale, alternateLocale: [locale === 'en' ? 'fr' : 'en'],
            images: [{ url: '/covers/a/b/custom.webp', alt: locale === 'en' ? 'Example walkthrough playlist' : 'Playlist de découverte de Example' }],
        });
        expect(metadata.title).toBe(locale === 'en' ? 'Example walkthrough playlist | GamesPassionFR' : 'Playlist de découverte de Example | GamesPassionFR');
        expect(metadata.description).toBe(locale === 'en' ? en.watchMetadata.playlistDescription.replace('{title}', 'Example') : fr.watchMetadata.playlistDescription.replace('{title}', 'Example'));
        expect(metadata).not.toHaveProperty('twitter');
    });
    it.each(['fr', 'en'] as const)('finds DLC videos using the existing cover convention (%s)', async locale => {
        const metadata = await videoMetadata({ params: Promise.resolve({ locale, id: 'video' }) });
        expect(metadata.openGraph?.images).toEqual([{
            url: '/covers/video/cover.webp', alt: locale === 'en' ? 'Expansion walkthrough video' : 'Vidéo de découverte de Expansion',
        }]);
        expect(metadata.openGraph).toMatchObject({ url: metadata.alternates?.canonical, locale });
    });
    it('prefers published games over duplicate DLC identifiers', async () => {
        loaders.dlcs.mockResolvedValue([{ dlcs: [{ title: 'Duplicate', playlistId: 'a/b', platform: 1 }] }]);
        expect((await playlistMetadata({ params: Promise.resolve({ locale: 'en', id: 'a/b' }) })).title)
            .toBe('Example walkthrough playlist | GamesPassionFR');
    });
    it('does not index unknown identifiers or a mismatched media type', async () => {
        for (const id of ['missing', 'a/b']) {
            expect(await videoMetadata({ params: Promise.resolve({ locale: 'en', id }) }))
                .toEqual({ robots: { index: false, follow: false } });
        }
    });
});
