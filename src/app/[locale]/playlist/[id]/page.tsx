import { watchMetadata } from '@/components/YTPlayer/metadata';
import { renderWatchPage, watchStaticParams } from '@/components/YTPlayer/WatchPage';
import type { WatchPageProps } from '@/components/YTPlayer/WatchPage';

export function generateMetadata(props: WatchPageProps) {
    return watchMetadata(props, 'PLAYLIST');
}

export function generateStaticParams() {
    return watchStaticParams('PLAYLIST');
}

export default function PlaylistPage(props: WatchPageProps) {
    return renderWatchPage(props, 'PLAYLIST');
}
