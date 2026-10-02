import { loadSelectionCatalogue } from './catalogue';
import * as gamesData from '@/lib/gamesData';
afterEach(() => { vi.restoreAllMocks(); });

it('resolves every existing game card from series and game tiers', async () => {
    const catalogue = await loadSelectionCatalogue();
    const ids = new Set(catalogue.map(entry => entry.selectionId));
    expect(ids.size).toBe(catalogue.length);
    const series = (await import('@/app/api/series/series.json')).default;
    const tiers = (await import('@/app/api/tier-lists/games/games.json')).default;
    const cards = [...series.flatMap(group => group.items).map(game => 'playlistId' in game ? game.playlistId : game.videoId), ...Object.values(tiers).flat().map(game => game.id)];
    expect(cards.filter(id => !id || !ids.has(id))).toEqual([]);
    expect(catalogue.some(entry => entry.source === 'backlog')).toBe(true);
    expect(catalogue.some(entry => entry.source === 'planning')).toBe(true);
});

it('classifies overlapping catalogue sources deterministically while retaining rendering sources', async () => {
    const published = { videoId: 'shared', title: 'Published', platform: 1, genres: [] };
    vi.spyOn(gamesData, 'loadPublishedGames').mockResolvedValue([published]);
    vi.spyOn(gamesData, 'loadDlcGroups').mockResolvedValue([{ id: 'group', game_title: 'Group', dlcs: [{ ...published, id: 1 }, { videoId: 'dlc-only', title: 'DLC', platform: 1, id: 2 }] }]);
    vi.spyOn(gamesData, 'loadPlanningGames').mockResolvedValue([published, { videoId: 'dlc-only', title: 'Planned DLC', platform: 1 }, { videoId: 'planned-only', title: 'Planning', platform: 1 }]);
    vi.spyOn(gamesData, 'loadBacklogGames').mockResolvedValue([]);
    const catalogue = await loadSelectionCatalogue();
    expect(catalogue.map(({ selectionId, category, source }) => ({ selectionId, category, source }))).toEqual([
        { selectionId: 'shared', category: 'games', source: 'published' },
        { selectionId: 'dlc-only', category: 'dlcs', source: 'published' },
        { selectionId: 'planned-only', category: 'planning', source: 'planning' },
    ]);
});
