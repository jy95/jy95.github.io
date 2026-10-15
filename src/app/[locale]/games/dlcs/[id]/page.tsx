import { loadDlcGroups, toDlcSummary } from '@/app/api/dlcs/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';
import type { DetailPageProps } from '@/features/catalog/metadata';

export { default } from './PageClient';

export async function generateStaticParams() {
    return (await loadDlcGroups()).map(entry => ({ id: String(entry.id) }));
}

export function generateMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'dlc', {
        load: loadDlcGroups,
        summarize: toDlcSummary,
        count: summary => summary.dlcsCount,
    });
}
