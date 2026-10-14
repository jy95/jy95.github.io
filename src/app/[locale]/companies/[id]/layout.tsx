import { getPathname } from '@/i18n/routing';
import { entityDetailMetadata } from '@/features/catalog/metadata';
import { companyImagePath, loadCompanies, toCompanySummary } from '@/app/api/companies/data';

export { default } from "@/components/common/LocaleLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    // Failed metadata lookups must not prevent the route from rendering its own error state.
    const company = (await loadCompanies().catch(() => [])).find((entry) => String(entry.id) === id);

    return entityDetailMetadata({
        locale,
        entity: 'company',
        found: company && {
            name: company.name,
            count: toCompanySummary(company, 'all').gamesCount,
            imagePath: companyImagePath(company.id),
        },
        pathnameFor: (l) => getPathname({ locale: l, href: { pathname: '/companies/[id]', params: { id } } }),
    });
}