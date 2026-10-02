import SelectionPageLoader from '@/features/selection/SelectionPageLoader';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'selection');
}

// The catalogue is fetched (and HTTP-cached) client-side: the selection itself lives in
// localStorage, so the server could only ever render a spinner.
export default function Page() {
    return <SuspenseBoundary><SelectionPageLoader /></SuspenseBoundary>;
}