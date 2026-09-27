import { buildCardEntry } from '@/domain/games/card';
import { COVER_PATHS } from '@/domain/games/coverPaths';
import type { RawGame } from '@/domain/games/types';

export type MediaSource = 'games' | 'planning' | 'pastPlanning' | 'tests' | 'dlcs';
type MediaIdType = 'videoId' | 'playlistId';
type MediaEntry = { title: string; coverFile?: string; videoId?: string; playlistId?: string };
export type MediaMetadata = { title: string; imagePath: string };

// This order matches the original lookup when an ID appears in several sources.
const sourcePriority: MediaSource[] = ['games', 'planning', 'pastPlanning', 'tests', 'dlcs'];

async function loadSource(source: MediaSource): Promise<MediaEntry[]> {
    switch (source) {
        case 'games': return (await import('@/app/api/games/games.json')).default;
        case 'planning': return (await import('@/app/api/planning/planning.json')).default;
        case 'pastPlanning': return (await import('@/app/api/planning/past-planning.json')).default;
        case 'tests': return (await import('@/app/api/tests/tests.json')).default;
        case 'dlcs': return (await import('@/app/api/dlcs/dlcs.json')).default.flatMap(game => game.dlcs as MediaEntry[]);
    }
}

export async function getMediaMetadata(source: MediaSource, type: MediaIdType, id: string): Promise<MediaMetadata | undefined> {
    const entry = (await loadSource(source)).find(game => game[type] === id);
    if (!entry?.title) return undefined;

    return {
        title: entry.title,
        imagePath: buildCardEntry(entry as RawGame, source === 'tests' ? COVER_PATHS.tests : COVER_PATHS.games).imagePath,
    };
}

export async function findMediaMetadata(type: MediaIdType, id: string): Promise<MediaMetadata | undefined> {
    for (const source of sourcePriority) {
        const metadata = await getMediaMetadata(source, type, id);
        if (metadata) return metadata;
    }
}
