import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { CardGame } from '@/domain/games';
import type { BacklogEntry, GameDetailsResponse, PlanningEntry } from '@/domain/games/details';

vi.mock('../games.json', () => ({ default: [
    { id: 10, title: 'Published playlist', playlistId: 'shared', platform: 1, genres: [2], coverFile: 'custom.webp', duration: '01:00:00', developers: [{ id: 1, name: 'Developer' }] },
    { id: 11, title: 'Published video', videoId: 'video-id', platform: 2, genres: [3] },
] }));
vi.mock('../../planning/planning.json', () => ({ default: [
    { title: 'Overlapping planning', playlistId: 'shared', platform: 1 },
    { title: 'Recorded planning', videoId: '42', platform: 2, endAt: '2020-01-01', coverFile: 'planned.webp' },
    { title: 'Pending planning', playlistId: 'pending', platform: 3, availableAt: '2099-01-01' },
] }));
vi.mock('../../backlog/backlog.json', () => ({ default: [
    { id: 42, title: 'Overlapping backlog' },
    { id: 101, title: 'Backlog game', notes: 'Keep notes', hltb_main: '10:00:00', platform: 4 },
] }));

import { GET } from './route';
import { GET as getGames } from '../route';
import { GET as getPlanning } from '../../planning/route';
import { GET as getBacklog } from '../../backlog/route';
import * as gamesData from '@/lib/gamesData';

afterEach(() => vi.restoreAllMocks());

function request(id: string) {
    return GET(new Request(`http://localhost/api/games/${encodeURIComponent(id)}`), { params: Promise.resolve({ id }) });
}

async function details(id: string): Promise<GameDetailsResponse> {
    const response = await request(id);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400, must-revalidate');
    return response.json();
}

describe('GET /api/games/[id]', () => {
    it('returns only the matching published playlist with the canonical transformation', async () => {
        const data = await details('shared');
        expect(data.source).toBe('published');
        expect(data.game).toMatchObject({ id: 'shared', title: 'Published playlist', url_type: 'PLAYLIST', url: 'https://www.youtube.com/playlist?list=shared', imagePath: '/covers/shared/custom.webp', duration: '01:00:00', developers: [{ id: 1, name: 'Developer' }] });
        expect(data).not.toHaveProperty('items');
        const catalogue = await (await getGames(new Request('http://localhost/api/games'))).json();
        expect(data.game).toEqual(catalogue.items[0]);
    });

    it('preserves video IDs and default cover paths rather than raw numeric IDs', async () => {
        const data = await details('video-id');
        expect(data).toMatchObject({ source: 'published', game: { id: 'video-id', url_type: 'VIDEO', url: 'https://www.youtube.com/watch?v=video-id', imagePath: '/covers/video-id/cover.webp' } });
        expect((await request('11')).status).toBe(404);
    });

    it('prefers published over planning for an overlapping string ID', async () => {
        const planningLoader = vi.spyOn(gamesData, 'loadPlanningGames');
        const backlogLoader = vi.spyOn(gamesData, 'loadBacklogGames');
        expect((await details('shared')).source).toBe('published');
        expect(planningLoader).not.toHaveBeenCalled();
        expect(backlogLoader).not.toHaveBeenCalled();
    });

    it('prefers planning over backlog and preserves recorded status and cover paths', async () => {
        const backlogLoader = vi.spyOn(gamesData, 'loadBacklogGames');
        const data = await details('42');
        expect(data).toMatchObject({ source: 'planning', game: { id: '42', title: 'Recorded planning', status: 'RECORDED', imagePath: '/covers/42/planned.webp' } });
        const planning = await (await getPlanning()).json();
        expect(data.game).toEqual(planning[1]);
        expect(backlogLoader).not.toHaveBeenCalled();
    });

    it('preserves pending planning status and availability', async () => {
        expect(await details('pending')).toMatchObject({ source: 'planning', game: { id: 'pending', status: 'PENDING', availableAt: '2099-01-01', imagePath: '/covers/pending/cover.webp' } });
    });

    it('uses the stored backlog ID, not its array index, and preserves backlog fields', async () => {
        const data = await details('101');
        expect(data).toEqual({ source: 'backlog', game: { id: '101', title: 'Backlog game', notes: 'Keep notes', hltb_main: '10:00:00', platform: 4, imagePath: '/backlogcovers/101/cover.webp' } });
        const backlog = await (await getBacklog()).json();
        expect(data.game).toEqual(backlog[1]);
        expect((await request('1')).status).toBe(404);
    });

    it.each(['unknown', '0101', '101suffix'])('returns HTTP 404 for unmatched ID %s', async (id) => {
        const response = await request(id);
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: 'Game not found' });
    });

    it('associates each source discriminator with its game type', () => {
        expectTypeOf<Extract<GameDetailsResponse, { source: 'published' }>['game']>().toEqualTypeOf<CardGame>();
        expectTypeOf<Extract<GameDetailsResponse, { source: 'planning' }>['game']>().toEqualTypeOf<PlanningEntry>();
        expectTypeOf<Extract<GameDetailsResponse, { source: 'backlog' }>['game']>().toEqualTypeOf<BacklogEntry>();
    });

    it('does not treat data loading failures as missing games', async () => {
        vi.spyOn(gamesData, 'loadPublishedGames').mockRejectedValueOnce(new Error('Data unavailable'));
        await expect(request('unknown')).rejects.toThrow('Data unavailable');
    });
});
