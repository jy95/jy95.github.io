import { renderWatchPage, watchStaticParams } from '@/components/YTPlayer/WatchPage';
import type { WatchPageProps } from '@/components/YTPlayer/WatchPage';

export function generateStaticParams() {
    return watchStaticParams('VIDEO');
}

export default function VideoPage(props: WatchPageProps) {
    return renderWatchPage(props, 'VIDEO');
}
