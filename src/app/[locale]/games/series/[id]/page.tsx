import { metadataPage } from '@/i18n/metadataPage';
import { loadSeries, toSeriesSummary } from '@/app/api/series/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';

import PageClient from './PageClient';

import type { DetailPageProps } from '@/features/catalog/metadata';

function PageContent(props: DetailPageProps) {
    return <PageClient {...props} />;
}

export async function generateStaticParams() {
    return (await loadSeries()).map(entry => ({ id: String(entry.id) }));
}

function loadMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'series', {
        load: loadSeries,
        summarize: toSeriesSummary,
        count: summary => summary.gamesCount,
    });
}

const route = metadataPage(loadMetadata, PageContent);
export const generateMetadata = route.generateMetadata;
export default route.Page;
