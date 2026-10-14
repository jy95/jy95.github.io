import { loadSeries, toSeriesSummary } from '@/app/api/series/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';
import type { DetailPageProps } from '@/features/catalog/metadata';

export { default } from './PageClient';

export async function generateStaticParams() {
    return (await loadSeries()).map(entry => ({ id: String(entry.id) }));
}

export function generateMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'series', async (id) => {
        const entry = (await loadSeries()).find(entry => String(entry.id) === id);
        if (!entry) return undefined;
        const summary = toSeriesSummary(entry);
        return { name: summary.name, count: summary.gamesCount, imagePath: summary.imagePath };
    });
}
