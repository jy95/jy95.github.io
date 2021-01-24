import React from 'react';
import {connect} from 'react-redux';
import {useTranslation} from "react-i18next";

import {get_scheduled_games} from "../../actions/planning";

// Style
import CircularProgress from '@material-ui/core/CircularProgress';
import { DataGrid } from '@material-ui/data-grid';
import CenteredGrid from "../Others/CenteredGrid";

// columns definitions
import getTableColumns from "./PlanningColumns";

function Viewer(props) {

    const {loading, data} = props;
    const { t } = useTranslation('common');

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_scheduled_games();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const date_options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const columns = getTableColumns(t, date_options);

    if (loading) {
        return <CenteredGrid>
            <CircularProgress/>
        </CenteredGrid>
    }
    // In the past => height: 450
    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                    <DataGrid rows={data} columns={columns} disableSelectionOnClick autoHeight showToolbar/>
                </div>
            </div>
        </div>
    )

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
