import { metadataPage } from '@/i18n/metadataPage';
import { loadCompanies, toCompanySummary } from '@/app/api/companies/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';

import PageClient from './PageClient';

import type { DetailPageProps } from '@/features/catalog/metadata';

function PageContent(props: DetailPageProps) {
    return <PageClient {...props} />;
}

export async function generateStaticParams() {
    return (await loadCompanies()).map(entry => ({ id: String(entry.id) }));
}

function loadMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'company', {
        load: loadCompanies,
        summarize: entry => toCompanySummary(entry, 'all'),
        count: summary => summary.gamesCount,
    });
}

const route = metadataPage(loadMetadata, PageContent);
export const generateMetadata = route.generateMetadata;
export default route.Page;
