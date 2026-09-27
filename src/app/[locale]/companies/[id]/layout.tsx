import { loadCompanies } from '@/app/api/companies/data';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import { notFound } from 'next/navigation';

export { default } from '@/components/common/PassThroughLayout';

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const company = (await loadCompanies()).find((entry) => String(entry.id) === id);
    if (!company) notFound();
    return staticSectionMetadata(locale, 'company', { title: `${company.name} | GamesPassionFR` });
}
