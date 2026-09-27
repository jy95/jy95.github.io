import { getCompanyMetadata } from '@/app/api/companies/data';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import { notFound } from 'next/navigation';

export { default } from '@/components/common/PassThroughLayout';

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const metadata = await getCompanyMetadata(id);
    if (!metadata) notFound();
    const { title, imagePath } = metadata;
    return staticSectionMetadata(locale, 'company', {
        title: `${title} | GamesPassionFR`,
        openGraph: { images: [imagePath] },
    });
}
