import { metadataPage } from '@/i18n/metadataPage';
import { watchMetadata } from '@/features/games/detail/watchMetadata';
import { renderWatchPage, watchStaticParams } from '@/components/YTPlayer/WatchPage';

import type { WatchPageProps } from '@/components/YTPlayer/WatchPage';

export function generateStaticParams() {
    return watchStaticParams('PLAYLIST');
}

function PageContent(props: WatchPageProps) {
    return renderWatchPage(props, 'PLAYLIST');
}

function loadMetadata(props: WatchPageProps) {
    return watchMetadata(props, 'PLAYLIST');
}

const route = metadataPage(loadMetadata, PageContent);
export const generateMetadata = route.generateMetadata;
export default route.Page;
