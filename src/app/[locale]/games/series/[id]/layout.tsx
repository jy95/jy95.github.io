import { getPathname } from '@/i18n/routing';
import { entityDetailMetadata } from '@/features/catalog/metadata';
import { loadSeries, toSeriesSummary } from '@/app/api/series/data';

export { default } from "@/components/common/LocaleLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    // Failed metadata lookups must not prevent the route from rendering its own error state.
    const series = (await loadSeries().catch(() => [])).find((entry) => String(entry.id) === id);
    const summary = series && toSeriesSummary(series);

    return entityDetailMetadata({
        locale,
        entity: 'series',
        found: summary && { name: summary.name, count: summary.gamesCount, imagePath: summary.imagePath },
        pathnameFor: (l) => getPathname({ locale: l, href: { pathname: '/games/series/[id]', params: { id } } }),
    });
}