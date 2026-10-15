import { loadSeries, toSeriesSummary } from '@/app/api/series/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';
import type { DetailPageProps } from '@/features/catalog/metadata';

export { default } from './PageClient';

export async function generateStaticParams() {
    return (await loadSeries()).map(entry => ({ id: String(entry.id) }));
}

export function generateMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'series', {
        load: loadSeries,
        summarize: toSeriesSummary,
        count: summary => summary.gamesCount,
    });
}
