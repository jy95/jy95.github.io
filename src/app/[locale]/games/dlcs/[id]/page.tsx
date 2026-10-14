import { getPathname } from '@/i18n/routing';
import { entityDetailMetadata } from '@/features/catalog/metadata';
import { loadDlcGroups, toDlcSummary } from '@/app/api/dlcs/data';
import PageClient from './PageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    const group = (await loadDlcGroups()).find((entry) => entry.id === id);
    const summary = group && toDlcSummary(group);

    return entityDetailMetadata({
        locale,
        entity: 'dlc',
        found: summary && { name: summary.name, count: summary.dlcsCount, imagePath: summary.imagePath },
        pathnameFor: (l) => getPathname({ locale: l, href: { pathname: '/games/dlcs/[id]', params: { id } } }),
    });
}

export default function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
    return <PageClient params={params} />;
}
