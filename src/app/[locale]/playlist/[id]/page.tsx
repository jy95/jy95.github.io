import { renderWatchPage, watchStaticParams } from '@/components/YTPlayer/WatchPage';
import type { WatchPageProps } from '@/components/YTPlayer/WatchPage';

export async function generateStaticParams() {
    return watchStaticParams('PLAYLIST');
}

export default async function PlaylistPage(props: WatchPageProps) {
    return renderWatchPage(props, 'PLAYLIST');
}
