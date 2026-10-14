import { expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({ getTranslations: vi.fn() }));
vi.mock('@/components/YTPlayer/Player', () => ({ default: vi.fn() }));
vi.mock('@/features/games/components/RandomButton', () => ({ default: vi.fn() }));
vi.mock('@/app/api/random/identifiers.json', () => ({ default: [
    { videoId: 'video', playlistId: 'playlist' },
    { videoId: 'video' }, { playlistId: 'playlist' },
    { videoId: 'another-video', playlistId: 'another-playlist' }, {},
] }));

import { generateStaticParams as videoParams } from './video/[id]/page';
import { generateStaticParams as playlistParams } from './playlist/[id]/page';

it('deduplicates video IDs and inherits locale generation from the parent layout', async () => {
    expect(await videoParams()).toEqual([{ id: 'video' }, { id: 'another-video' }]);
});
it('deduplicates playlist IDs without emitting absent identifiers', async () => {
    expect(await playlistParams()).toEqual([{ id: 'playlist' }, { id: 'another-playlist' }]);
});
