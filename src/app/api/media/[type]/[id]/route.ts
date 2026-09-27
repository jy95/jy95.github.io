import { getMediaTitle } from '@/domain/games/mediaTitles';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ type: string; id: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { type, id } = await params;
    if (type !== 'video' && type !== 'playlist') {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const title = getMediaTitle(type === 'video' ? 'videoId' : 'playlistId', id);
    if (!title) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    return NextResponse.json({ title }, {
        headers: { 'Cache-Control': 'public, max-age=86400, must-revalidate' },
    });
}
