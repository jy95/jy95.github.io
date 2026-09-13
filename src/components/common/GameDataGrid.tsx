"use client";

import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import GameDetailView from '@/features/games/detail/GameDetailView';
import useMuiXDataGridText from '@/hooks/useMuiXDataGridText';
import type { GridColDef, GridEventListener, GridSortModel, GridColumnVisibilityModel } from '@mui/x-data-grid';
import type { RawGameDetailsEntry } from '@/features/games/detail/adapters';

type Props<T extends RawGameDetailsEntry> = {
    rows: T[];
    columns: GridColDef[];
    loading: boolean;
    sortModel: GridSortModel;
    columnVisibilityModel?: GridColumnVisibilityModel;
    showVoteSection?: boolean;
};

export function GameDataGrid<T extends RawGameDetailsEntry>({
    rows, columns, loading, sortModel, columnVisibilityModel, showVoteSection = true,
}: Props<T>) {
    const customLocaleText = useMuiXDataGridText();
    const [selectedGame, setSelectedGame] = useState<T | null>(null);

    const handleRowClick: GridEventListener<'rowClick'> = (params) => setSelectedGame(params.row as T);

    return (
        <>
            <DataGrid
                showToolbar
                rows={rows}
                columns={columns}
                onRowClick={handleRowClick}
                disableRowSelectionOnClick
                localeText={customLocaleText}
                slotProps={{ loadingOverlay: { variant: 'linear-progress', noRowsVariant: 'skeleton' } }}
                loading={loading}
                sortingOrder={['asc', 'desc']}
                initialState={{ sorting: { sortModel }, columns: { columnVisibilityModel } }}
            />
            {selectedGame && (
                <GameDetailView game={selectedGame} onClose={() => setSelectedGame(null)} showVoteSection={showVoteSection} />
            )}
        </>
    );
}