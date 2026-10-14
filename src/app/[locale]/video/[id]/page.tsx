import { renderWatchPage, watchStaticParams } from '@/components/YTPlayer/WatchPage';
import type { WatchPageProps } from '@/components/YTPlayer/WatchPage';

export async function generateStaticParams() {
    return watchStaticParams('VIDEO');
}

export default async function VideoPage(props: WatchPageProps) {
    return renderWatchPage(props, 'VIDEO');
}
