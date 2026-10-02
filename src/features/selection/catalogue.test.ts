import { loadSelectionCatalogue } from './catalogue';
import * as gamesData from '@/lib/gamesData';
import type { RawPublishedGame } from '@/lib/gamesData';

vi.mock('@/lib/gamesData', async importOriginal => ({
    ...await importOriginal<typeof import('@/lib/gamesData')>(),
    loadPublishedGames: vi.fn(),
    loadDlcGroups: vi.fn(),
    loadPlanningGames: vi.fn(),
    loadBacklogGames: vi.fn(),
}));

const published: RawPublishedGame = { videoId: 'shared', title: 'Published', platform: 1, genres: [] };

beforeEach(() => {
    vi.mocked(gamesData.loadPublishedGames).mockResolvedValue([]);
    vi.mocked(gamesData.loadDlcGroups).mockResolvedValue([]);
    vi.mocked(gamesData.loadPlanningGames).mockResolvedValue([]);
    vi.mocked(gamesData.loadBacklogGames).mockResolvedValue([]);
});
afterEach(() => vi.resetAllMocks());

it('converts categories and keeps the first source for duplicate identifiers', async () => {
    vi.mocked(gamesData.loadPublishedGames).mockResolvedValue([published, { ...published, videoId: '7', title: 'Published collision' }]);
    vi.mocked(gamesData.loadDlcGroups).mockResolvedValue([{ id: 'group', game_title: 'Group', dlcs: [{ ...published, id: 1 }, { videoId: 'dlc-only', title: 'DLC', platform: 1, id: 2 }] }]);
    vi.mocked(gamesData.loadPlanningGames).mockResolvedValue([published, { videoId: 'dlc-only', title: 'Planned DLC', platform: 1 }, { videoId: 'planned-only', title: 'Planning', platform: 1 }]);
    vi.mocked(gamesData.loadBacklogGames).mockResolvedValue([{ id: 42, title: 'Waiting' }, { id: 7, title: 'Collision' }]);
    const catalogue = await loadSelectionCatalogue();
    expect(catalogue.map(({ selectionId, category, source }) => ({ selectionId, category, source }))).toEqual([
        { selectionId: 'shared', category: 'games', source: 'published' },
        { selectionId: '7', category: 'games', source: 'published' },
        { selectionId: 'dlc-only', category: 'dlcs', source: 'published' },
        { selectionId: 'planned-only', category: 'planning', source: 'planning' },
        { selectionId: '42', category: 'backlog', source: 'backlog' },
    ]);
    expect(catalogue[0].game).toMatchObject({ id: 'shared', title: 'Published', url_type: 'VIDEO' });
    expect(catalogue[3].game).toHaveProperty('status', 'PENDING');
    expect(catalogue[4].game).toMatchObject({ id: '42', imagePath: '/backlogcovers/42/cover.webp' });
});

it('returns an empty catalogue for empty sources', async () => {
    expect(await loadSelectionCatalogue()).toEqual([]);
});

it.each(['loadPublishedGames', 'loadDlcGroups', 'loadPlanningGames', 'loadBacklogGames'] as const)('propagates %s failures', async loader => {
    vi.mocked(gamesData[loader]).mockRejectedValue(new Error('loader failed'));
    await expect(loadSelectionCatalogue()).rejects.toThrow('loader failed');
});
