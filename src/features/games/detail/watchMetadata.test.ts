import { beforeEach, expect, it, vi } from 'vitest';
import { createTranslator } from 'next-intl';
import en from '../../../../messages/en.json';
import fr from '../../../../messages/fr.json';

const loaders = vi.hoisted(() => ({ published: vi.fn(), dlcs: vi.fn(), planning: vi.fn() }));
vi.mock('@/lib/gamesData', async original => ({
    ...await original<typeof import('@/lib/gamesData')>(),
    loadPublishedGames: loaders.published, loadDlcGroups: loaders.dlcs, loadPlanningGames: loaders.planning,
}));
vi.mock('next-intl/server', () => ({
    getTranslations: async ({ locale }: { locale: 'fr' | 'en' }) => createTranslator({
        locale, messages: locale === 'en' ? en : fr, namespace: 'detailMetadata',
    }),
}));

import { watchMetadata } from './watchMetadata';

beforeEach(() => {
    vi.resetAllMocks();
    loaders.published.mockResolvedValue([{ title: 'Example', playlistId: 'playlist', videoId: 'a/b' }]);
    loaders.dlcs.mockResolvedValue([]);
    loaders.planning.mockResolvedValue([]);
});

it.each(['fr', 'en'] as const)('resolves both identities on the same catalog record (%s)', async locale => {
    for (const type of ['VIDEO', 'PLAYLIST'] as const) {
        const id = type === 'VIDEO' ? 'a/b' : 'playlist';
        const path = `${locale === 'en' ? '/en' : ''}/${type === 'VIDEO' ? 'video' : 'playlist'}/${encodeURIComponent(id)}`;
        const metadata = await watchMetadata({ params: Promise.resolve({ locale, id }) }, type);
        expect(metadata.title).toBe('Example');
        expect(metadata.description).toBe(locale === 'en'
            ? `Watch the ${type === 'VIDEO' ? 'video' : 'video playlist'} for Example on GamesPassionFR.`
            : `Regardez la ${type === 'VIDEO' ? 'vidéo' : 'playlist de vidéos'} de Example sur GamesPassionFR.`);
        expect(metadata.alternates?.canonical).toBe(path);
        expect(metadata.openGraph).toMatchObject({ type: 'website', url: path, title: 'Example | GamesPassionFR',
            images: [{ url: '/covers/playlist/cover.webp', alt: locale === 'en' ? 'Game cover for Example' : 'Jaquette de Example' }] });
        expect(metadata.twitter).toMatchObject({ card: 'summary', description: metadata.description });
    }
});

it('does not accept a playlist identifier as a video identifier', async () => {
    expect(await watchMetadata({ params: Promise.resolve({ locale: 'en', id: 'playlist' }) }, 'VIDEO'))
        .toEqual({ robots: { index: false, follow: false } });
});

it('preserves published, DLC, and planning precedence', async () => {
    loaders.dlcs.mockResolvedValue([{ dlcs: [{ title: 'DLC', videoId: 'a/b' }] }]);
    loaders.planning.mockResolvedValue([{ title: 'Planned', videoId: 'a/b' }]);
    const props = { params: Promise.resolve({ locale: 'en', id: 'a/b' }) };
    expect((await watchMetadata(props, 'VIDEO')).title).toBe('Example');
    loaders.published.mockResolvedValue([]);
    expect((await watchMetadata(props, 'VIDEO')).title).toBe('DLC');
    loaders.dlcs.mockResolvedValue([]);
    expect((await watchMetadata(props, 'VIDEO')).title).toBe('Planned');
});

it('noindexes failed catalog lookups', async () => {
    loaders.published.mockRejectedValue(new Error('unavailable'));
    expect(await watchMetadata({ params: Promise.resolve({ locale: 'en', id: 'a/b' }) }, 'VIDEO'))
        .toEqual({ robots: { index: false, follow: false } });
});
