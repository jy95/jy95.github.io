import { getPathname } from '@/i18n/routing';
import { entityDetailMetadata } from '@/features/catalog/metadata';
import { companyImagePath, loadCompanies, toCompanySummary } from '@/app/api/companies/data';
import PageClient from './PageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = await params;
    const company = (await loadCompanies()).find((entry) => String(entry.id) === id);

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

export default function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
    return <PageClient params={params} />;
}
