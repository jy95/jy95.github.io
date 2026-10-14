import { loadDlcGroups, toDlcSummary } from '@/app/api/dlcs/data';
import { entityRouteMetadata } from '@/features/catalog/metadata';
import type { DetailPageProps } from '@/features/catalog/metadata';

export { default } from './PageClient';

export async function generateStaticParams() {
    return [...new Set((await loadDlcGroups()).map(entry => String(entry.id)))].map(id => ({ id }));
}

export function generateMetadata(props: DetailPageProps) {
    return entityRouteMetadata(props, 'dlc', async (id) => {
        const entry = (await loadDlcGroups()).find(entry => String(entry.id) === id);
        if (!entry) return undefined;
        const summary = toDlcSummary(entry);
        return { name: summary.name, count: summary.dlcsCount, imagePath: summary.imagePath };
    });
}
