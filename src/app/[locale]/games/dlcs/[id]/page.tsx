import { metadataPage } from '@/i18n/metadataPage';
import { loadDlcGroups, toDlcSummary } from '@/app/api/dlcs/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';

import PageClient from './PageClient';

import type { DetailPageProps } from '@/features/catalog/metadata';

function PageContent(props: DetailPageProps) {
    return <PageClient {...props} />;
}

export async function generateStaticParams() {
    return (await loadDlcGroups()).map(entry => ({ id: String(entry.id) }));
}

function loadMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'dlc', {
        load: loadDlcGroups,
        summarize: toDlcSummary,
        count: summary => summary.dlcsCount,
    });
}

const route = metadataPage(loadMetadata, PageContent);
export const generateMetadata = route.generateMetadata;
export default route.Page;
