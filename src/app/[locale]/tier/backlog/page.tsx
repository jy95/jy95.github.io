import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import PageClient from './PageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'tierBacklog');
}

export default function Page() {
    return <PageClient />;
}
