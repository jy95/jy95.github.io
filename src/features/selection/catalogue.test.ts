import { loadSelectionCatalogue } from './catalogue';
import * as data from '@/lib/gamesData';
vi.mock('@/lib/gamesData', async original => ({ ...await original<typeof import('@/lib/gamesData')>(), loadPublishedGames: vi.fn(), loadDlcGroups: vi.fn(), loadPlanningGames: vi.fn(), loadBacklogGames: vi.fn() }));
beforeEach(() => {
    vi.mocked(data.loadPublishedGames).mockResolvedValue([]);
    vi.mocked(data.loadDlcGroups).mockResolvedValue([]);
    vi.mocked(data.loadPlanningGames).mockResolvedValue([]);
    vi.mocked(data.loadBacklogGames).mockResolvedValue([]);
});
afterEach(() => vi.resetAllMocks());
it('preserves category-specific collisions and deduplicates within each category', async () => {
    const raw = { videoId: '7', title: 'Published', platform: 1, genres: [] };
    vi.mocked(data.loadPublishedGames).mockResolvedValue([raw, { ...raw, title: 'Duplicate' }]);
    vi.mocked(data.loadDlcGroups).mockResolvedValue([{ id: 'group', game_title: 'Group', dlcs: [{ ...raw, id: 1 }] }]);
    vi.mocked(data.loadPlanningGames).mockResolvedValue([raw]);
    vi.mocked(data.loadBacklogGames).mockResolvedValue([{ id: 7, title: 'Waiting' }]);
    const catalogue = await loadSelectionCatalogue();
    expect(catalogue.map(entry => [entry.category, entry.selectionId])).toEqual([['games', '7'], ['dlcs', '7'], ['planning', '7'], ['backlog', '7']]);
    expect(catalogue[0].game.title).toBe('Published');
});
it('handles empty sources', async () => { expect(await loadSelectionCatalogue()).toEqual([]); });
it.each(['loadPublishedGames', 'loadDlcGroups', 'loadPlanningGames', 'loadBacklogGames'] as const)('propagates %s failures', async loader => {
    vi.mocked(data[loader]).mockRejectedValue(new Error('failed'));
    await expect(loadSelectionCatalogue()).rejects.toThrow('failed');
});
