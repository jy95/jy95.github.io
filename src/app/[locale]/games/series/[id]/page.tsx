import { getPathname } from '@/i18n/routing';
import { entityDetailMetadata } from '@/features/catalog/metadata';
import { loadSeries, toSeriesSummary } from '@/app/api/series/data';
import PageClient from './PageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    const series = (await loadSeries()).find((entry) => String(entry.id) === id);
    const summary = series && toSeriesSummary(series);

    return entityDetailMetadata({
        locale,
        entity: 'series',
        found: summary && { name: summary.name, count: summary.gamesCount, imagePath: summary.imagePath },
        pathnameFor: (l) => getPathname({ locale: l, href: { pathname: '/games/series/[id]', params: { id } } }),
    });
}

export default function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
    return <PageClient params={params} />;
}
