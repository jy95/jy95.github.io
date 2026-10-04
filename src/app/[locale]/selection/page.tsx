import SelectionPageLoader from '@/features/selection/components/SelectionPageLoader';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'selection');
}

export default function Page() {
    return (
        <SuspenseBoundary>
            <SelectionPageLoader />
        </SuspenseBoundary>
    );
}
