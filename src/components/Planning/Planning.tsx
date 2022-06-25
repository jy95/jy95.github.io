import { useEffect } from 'react';
import i18n from 'i18next';
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridSlotsComponent } from '@mui/x-data-grid';

// Realod Wrapper
// @ts-ignore
import ReloadWrapper from "../Others/ReloadWrapper.tsx";
// columns definitions
// @ts-ignore
import getTableColumns from "./PlanningColumns.tsx";

// @ts-ignore
import { useAsyncMemo } from "../../hooks/useAsyncMemo.tsx";

// Redux
// @ts-ignore
import { fetchPlanning } from "../../services/planningSlice.tsx";
// @ts-ignore
import type { RootState, AppDispatch } from '../Store.tsx';

function Viewer(_props) {

    const dispatch: AppDispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.planning.loading);
    const error = useSelector((state: RootState) => state.planning.error);
    const data = useSelector((state: RootState) => state.planning.planning);
    const { t } = useTranslation('common');

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchPlanning());
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const date_options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const language = i18n.language;
    const columns = getTableColumns(t, date_options, language);
    const customLocaleText = useAsyncMemo(async () => {
        switch(language) {
            case 'fr':
                const { 
                    frFR : {
                        components : {
                            MuiDataGrid : {
                                defaultProps : {
                                    localeText
                                }
                            }
                        }
                    }
                } = await import("@mui/x-data-grid");
                return localeText;
            // English is by default built-in in @mui package, so no need to include
            default:
                return {};
        }
    }, [language], {} as any);

    let components : Partial<GridSlotsComponent> = {
        Toolbar: GridToolbar
    };

    return <ReloadWrapper 
        loading={loading}
        error={error}
        reloadFct={() => {dispatch(fetchPlanning());}}
        component={
            <div style={{ height: 450, width: '100%' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                        <DataGrid 
                            rows={data} 
                            columns={columns} 
                            disableSelectionOnClick 
                            //disableExtendRowFullWidth // No needed for now
                            disableColumnFilter // or filterable: false in each column
                            autoHeight  
                            localeText={customLocaleText}
                            components={components}
                            sortingOrder={['asc', 'desc']}
                            initialState={{
                                sorting: {
                                  sortModel: [{ field: 'releaseDate', sort: 'asc' }],
                                },
                            }}
                        />
                    </div>
                </div>
            </div>            
        } 
    />
}

export default Viewer;
