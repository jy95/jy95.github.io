import { metadataPage } from '@/i18n/metadataPage';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import PageClient from './PageClient';

async function loadMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'tierTests');
}

function PageContent() {
    return <PageClient />;
}

const route = metadataPage(loadMetadata, PageContent);
export const generateMetadata = route.generateMetadata;
export default route.Page;
