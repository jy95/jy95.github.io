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
            images: [{ url: '/covers/a/b/custom.webp', alt: 'Example' }],
        });
        expect(metadata.title).toBe('Example | GamesPassionFR');
        expect(metadata.description).toBe(locale === 'en' ? en.watchMetadata.description.replace('{title}', 'Example') : fr.watchMetadata.description.replace('{title}', 'Example'));
        expect(metadata).not.toHaveProperty('twitter');
    });
    it.each(['fr', 'en'] as const)('finds DLC videos using the existing cover convention (%s)', async locale => {
        const metadata = await videoMetadata({ params: Promise.resolve({ locale, id: 'video' }) });
        expect(metadata.openGraph?.images).toEqual([{
            url: '/covers/video/cover.webp', alt: 'Expansion',
        }]);
        expect(metadata.openGraph).toMatchObject({ url: metadata.alternates?.canonical, locale });
    });

    it.each(['fr', 'en'] as const)('shares wording across media types and preserves long names (%s)', async locale => {
        const title = 'The Adventures of a Hero: A Very Long Game Name & Its Expansion '.repeat(4).trim();
        loaders.games.mockResolvedValue([
            { title, playlistId: 'playlist', platform: 1 },
            { title, videoId: 'video', platform: 1 },
        ]);
        const playlist = await playlistMetadata({ params: Promise.resolve({ locale, id: 'playlist' }) });
        const video = await videoMetadata({ params: Promise.resolve({ locale, id: 'video' }) });
        const messages = locale === 'en' ? en : fr;
        for (const metadata of [playlist, video]) {
            const route = metadata === playlist ? 'playlist' : 'video';
            expect(metadata.alternates?.canonical).toBe(`${locale === 'en' ? '/en' : ''}/${route}/${route}`);
            expect(metadata.alternates?.languages).toEqual({ fr: `/${route}/${route}`, en: `/en/${route}/${route}` });
            expect(metadata.title).toBe(`${title} | GamesPassionFR`);
            expect(metadata.description).toBe(locale === 'en'
                ? `Explore ${title} on GamesPassionFR.`
                : `Découvrez ${title} sur GamesPassionFR.`);
            expect(String(metadata.title).match(/GamesPassionFR/g)).toHaveLength(1);
            expect(metadata.openGraph).toMatchObject({
                title: messages.watchMetadata.title.replace('{title}', title),
                description: metadata.description, url: metadata.alternates?.canonical,
                images: [{ url: metadata === playlist ? '/covers/playlist/cover.webp' : '/covers/video/cover.webp', alt: title }],
            });
            expect(metadata).not.toHaveProperty('twitter');
        }
        expect(video.title).toBe(playlist.title);
        expect(video.description).toBe(playlist.description);
        expect(video.alternates?.canonical).not.toBe(playlist.alternates?.canonical);
    });
    it('prefers published games over duplicate DLC identifiers', async () => {
        loaders.dlcs.mockResolvedValue([{ dlcs: [{ title: 'Duplicate', playlistId: 'a/b', platform: 1 }] }]);
        expect((await playlistMetadata({ params: Promise.resolve({ locale: 'en', id: 'a/b' }) })).title)
            .toBe('Example | GamesPassionFR');
    });
    it.each(['fr', 'en'] as const)('does not index unknown identifiers or a mismatched media type (%s)', async locale => {
        for (const id of ['missing', 'a/b']) {
            expect(await videoMetadata({ params: Promise.resolve({ locale, id }) }))
                .toEqual({ robots: { index: false, follow: false } });
        }
        expect(await playlistMetadata({ params: Promise.resolve({ locale, id: 'missing' }) }))
            .toEqual({ robots: { index: false, follow: false } });
    });
});
