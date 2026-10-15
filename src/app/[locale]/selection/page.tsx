import { metadataPage } from '@/i18n/metadataPage';
import SelectionPageLoader from '@/features/selection/components/SelectionPageLoader';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';

async function loadMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'selection');
}

function PageContent() {
    return (
        <SuspenseBoundary>
            <SelectionPageLoader />
        </SuspenseBoundary>
    );
}

const route = metadataPage(loadMetadata, PageContent);
export const generateMetadata = route.generateMetadata;
export default route.Page;
