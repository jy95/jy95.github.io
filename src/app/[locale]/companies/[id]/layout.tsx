import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import { getCompanyApiTitle } from '@/lib/server/apiTitles';

export { default } from '@/components/common/PassThroughLayout';

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const title = await getCompanyApiTitle(id);
    return staticSectionMetadata(locale, 'company', { title: `${title} | GamesPassionFR` });
}
