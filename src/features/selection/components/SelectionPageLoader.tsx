'use client';

import CircularProgress from '@mui/material/CircularProgress';
import { useGetSelectionCatalogueQuery } from '@/redux/services/selectionAPI';
import { QueryBoundary } from '@/components/common/QueryBoundary';
import SelectionPage from './SelectionPage';

export default function SelectionPageLoader() {
    const { data, error, isLoading, refetch } = useGetSelectionCatalogueQuery();

    return (
        <QueryBoundary
            error={error}
            isLoading={isLoading}
            data={data}
            onRetry={refetch}
            loadingFallback={<CircularProgress />}
        >
            {catalogue => <SelectionPage catalogue={catalogue} />}
        </QueryBoundary>
    );
}
