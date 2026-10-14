import SelectionPageLoader from '@/features/selection/components/SelectionPageLoader';
import { SuspenseBoundary } from '@/components/common/SuspenseBoundary';
import { selectionMetadata } from '@/features/selection/metadata';

export async function generateMetadata({ params, searchParams }: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ entries?: string | string[] }>;
}) {
    return selectionMetadata((await params).locale, (await searchParams).entries);
}

export default function Page() {
    return (
        <SuspenseBoundary>
            <SelectionPageLoader />
        </SuspenseBoundary>
    );
}
