import React from 'react';
import {connect} from 'react-redux';
import i18n from 'i18next';
import {useTranslation} from "react-i18next";

// Material UI
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// Realod Wrapper
import ReloadWrapper from "../Others/ReloadWrapper.tsx";
// columns definitions
import getTableColumns from "./PlanningColumns.tsx";
// Custom French translation
import customTranslation from "./PlanningFrenchLabels.tsx";

// Redux actions
import {get_scheduled_games} from "../../actions/planning.tsx";

function Viewer(props) {

    const {loading, error, data} = props;
    const { t } = useTranslation('common');

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_scheduled_games();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const date_options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const language = i18n.language;
    const columns = getTableColumns(t, date_options, language);
    const customLocaleText = (language.startsWith("fr")) ? customTranslation : {};

    return <ReloadWrapper 
        loading={loading}
        error={error}
        reloadFct={() => {props.get_scheduled_games();}}
        component={
            <div style={{ height: 450, width: '100%' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                        <DataGrid 
                            rows={data} 
                            columns={columns as any} 
                            disableSelectionOnClick 
                            //disableExtendRowFullWidth // No needed for now
                            disableColumnFilter // or filterable: false in each column
                            autoHeight  
                            localeText={customLocaleText}
                            components={{ Toolbar: GridToolbar }}
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

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    data: state.planning.planning,
    loading: state.planning.loading,
    error: state.planning.error,
});

const mapDispatchToProps = {
    get_scheduled_games
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Viewer);
