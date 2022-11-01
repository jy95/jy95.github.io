import { useEffect } from 'react';
import { useTranslation } from "react-i18next";

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridSlotsComponent } from '@mui/x-data-grid';

// Realod Wrapper
import ReloadWrapper from "../Others/ReloadWrapper";
// columns definitions
import getTableColumns from "./PlanningColumns";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";

// Redux
import { fetchPlanning } from "../../services/planningSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/typedRedux";

function Viewer(_props : {[key: string | number | symbol] : any}) {

    const dispatch = useAppDispatch();
    const loading = useAppSelector((state) => state.planning.loading);
    const error = useAppSelector((state) => state.planning.error);
    const data = useAppSelector((state) => state.planning.planning);
    const { t } = useTranslation('common');

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchPlanning());
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const date_options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

    const { i18n } = useTranslation('common');
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
                } = await import(/* webpackExports: "frFR" */ "@mui/x-data-grid");
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
