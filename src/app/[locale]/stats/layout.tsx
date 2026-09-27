import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';

export { default } from "@/components/common/LocaleLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'stats');
}
