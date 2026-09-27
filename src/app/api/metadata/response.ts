import { findMediaMetadata } from '@/domain/games/mediaTitles';
import { NextResponse } from 'next/server';

export async function getMediaResponse(type: string, id: string) {
    if (type !== 'video' && type !== 'playlist') {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const metadata = await findMediaMetadata(type === 'video' ? 'videoId' : 'playlistId', id);
    if (!metadata) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    return NextResponse.json(metadata, {
        headers: { 'Cache-Control': 'public, max-age=86400, must-revalidate' },
    });
}
