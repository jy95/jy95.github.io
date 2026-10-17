import { watchMetadata } from '@/components/YTPlayer/metadata';
import { renderWatchPage, watchStaticParams } from '@/components/YTPlayer/WatchPage';
import type { WatchPageProps } from '@/components/YTPlayer/WatchPage';

export function generateMetadata(props: WatchPageProps) {
    return watchMetadata(props, 'VIDEO');
}

export function generateStaticParams() {
    return watchStaticParams('VIDEO');
}

export default function VideoPage(props: WatchPageProps) {
    return renderWatchPage(props, 'VIDEO');
}
