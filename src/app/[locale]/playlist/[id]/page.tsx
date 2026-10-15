import { renderWatchPage, watchStaticParams } from '@/components/YTPlayer/WatchPage';
import type { WatchPageProps } from '@/components/YTPlayer/WatchPage';

export function generateStaticParams() {
    return watchStaticParams('PLAYLIST');
}

export default function PlaylistPage(props: WatchPageProps) {
    return renderWatchPage(props, 'PLAYLIST');
}
