import SelectionPage from '@/features/selection/SelectionPage';
import { loadSelectionCatalogue } from '@/features/selection/catalogue';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';
import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'selection');
}

export default async function Page() {
    const catalogue = await loadSelectionCatalogue();
    return <SuspenseBoundary><SelectionPage catalogue={catalogue} /></SuspenseBoundary>;
}
