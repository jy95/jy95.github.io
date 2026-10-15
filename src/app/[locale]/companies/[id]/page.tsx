import { loadCompanies, toCompanySummary } from '@/app/api/companies/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';
import type { DetailPageProps } from '@/features/catalog/metadata';

export { default } from './PageClient';

export async function generateStaticParams() {
    return (await loadCompanies()).map(entry => ({ id: String(entry.id) }));
}

export function generateMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'company', {
        load: loadCompanies,
        summarize: entry => toCompanySummary(entry, 'all'),
        count: summary => summary.gamesCount,
    });
}
