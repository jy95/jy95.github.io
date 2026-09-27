import games from '@/app/api/games/games.json';
import planning from '@/app/api/planning/planning.json';
import pastPlanning from '@/app/api/planning/past-planning.json';
import tests from '@/app/api/tests/tests.json';
import dlcs from '@/app/api/dlcs/dlcs.json';

type MediaEntry = { title: string; videoId?: string; playlistId?: string };

// Prefer the game catalog, then current planning, past planning, reviews, and DLCs.
// The first matching title wins when an identifier occurs in more than one file.
const sources: MediaEntry[][] = [games, planning, pastPlanning, tests, dlcs.flatMap((game) => game.dlcs as MediaEntry[])];

export function getMediaTitle(type: 'videoId' | 'playlistId', id: string): string | undefined {
    for (const entries of sources) {
        const title = entries.find((entry) => entry[type] === id)?.title;
        if (title) return title;
    }
}
