import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import type { YTUrlType } from '@/domain/games';

const { source, translations } = vi.hoisted(() => ({
    source: { failure: false, entries: [] as { videoId?: string | number; playlistId?: string | number }[] },
    translations: vi.fn(async () => (key: string) => `translated:${key}`),
}));
vi.mock('@/components/YTPlayer/metadata', () => ({ watchMetadata: vi.fn() }));
vi.mock('next-intl/server', () => ({ getTranslations: translations }));
vi.mock('@/components/YTPlayer/Player', () => ({
    default: ({ type, identifier }: { type: YTUrlType; identifier: string }) => <div>{type}:{identifier}</div>,
}));
vi.mock('@/features/games/components/RandomButton', () => ({ default: ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('@/app/api/random/identifiers.json', () => ({ get default() {
    if (source.failure) throw new Error('identifiers unavailable');
    return source.entries;
} }));

import * as video from './video/[id]/page';
import * as playlist from './playlist/[id]/page';

beforeEach(() => {
    source.failure = false;
    source.entries = [{ videoId: 'video', playlistId: 'playlist' }, { videoId: 123 }, { playlistId: 456 }, {}];
    translations.mockClear();
});
for (const [route, type, ids] of [
    [video, 'VIDEO', ['video', '123']], [playlist, 'PLAYLIST', ['playlist', '456']],
] as const) {
    it(`enumerates ${type} identifiers in order, filtering absent IDs and inheriting parent locales`, async () => {
        expect(await route.generateStaticParams()).toEqual(ids.map(id => ({ id })));
        source.entries = [];
        expect(await route.generateStaticParams()).toEqual([]);
    });
    it(`renders the ${type} route with promised parameters and a translated random label`, async () => {
        render(await route.default({ params: Promise.resolve({ id: 'a/b', locale: 'en' }) }));
        expect(screen.getByText(`${type}:a/b`)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'translated:randomButtonLabel' })).toBeInTheDocument();
        expect(translations).toHaveBeenCalledWith('gamesLibrary');
    });
    it(`propagates ${type} identifier loading failures`, async () => {
        source.failure = true;
        await expect(route.generateStaticParams()).rejects.toThrow('identifiers unavailable');
    });
    it(`propagates rejected ${type} parameters`, async () => {
        await expect(route.default({ params: Promise.reject(new Error('parameters unavailable')) })).rejects.toThrow('parameters unavailable');
    });
    it(`propagates ${type} translation failures`, async () => {
        translations.mockRejectedValueOnce(new Error('translations unavailable'));
        await expect(route.default({ params: Promise.resolve({ id: 'watch', locale: 'fr' }) }))
            .rejects.toThrow('translations unavailable');
    });
}
