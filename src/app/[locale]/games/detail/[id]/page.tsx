import { metadataPage } from '@/i18n/metadataPage';
import { gameDetailRouteMetadata as loadMetadata } from '@/features/games/detail/metadata';
import PageClient from './PageClient';

import type { DetailPageProps } from '@/features/catalog/metadata';

export { gameDetailStaticParams as generateStaticParams } from '@/lib/gameDetails';

function PageContent(props: DetailPageProps) {
    return <PageClient {...props} />;
}

const route = metadataPage(loadMetadata, PageContent);
export const generateMetadata = route.generateMetadata;
export default route.Page;
