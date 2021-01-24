import React from 'react';
import {connect} from 'react-redux';
import {useTranslation} from "react-i18next";

import {get_scheduled_games} from "../../actions/planning";
import iconsSVG from "../GamesView/PlatformIcons";

// Style
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Tooltip from '@material-ui/core/Tooltip';
import { DataGrid } from '@material-ui/data-grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import SvgIcon from '@material-ui/core/SvgIcon';
import CenteredGrid from "../Others/CenteredGrid";

// columns definitions
const getTableColumns = (t, date_options) => [
    {
        field: "title", 
        headerName: t("planning.columns.title"),
        headerAlign: 'center',
        renderCell: (params) => (
            <Tooltip title={params.value} aria-label={params.value}>
                <div>
                    {params.value}
                </div>
            </Tooltip>
        ),
        width: 270
    },
    {
        field: "platform",
        headerName: t("planning.columns.platform"),
        //headerAlign: 'center',
        //align: 'center',
        renderCell: (params) => (
            <SvgIcon titleAccess={params.value}>
                <path d={iconsSVG[params.value]} />
            </SvgIcon>
        )
    },
    {
        field: "releaseDate", 
        headerName: t("planning.columns.releaseDate"),
        headerAlign: 'center',
        renderCell: (params) => (
            <>
                {params.value.toLocaleDateString(undefined, date_options)}
            </>
        ),
        width: 200
    },
    {
        field: "status",
        headerName: t("planning.columns.status"),
        //headerAlign: 'center',
        renderCell: (params) => (
            <Tooltip title={t("planning.states." + params.value )} aria-label={params.value}>
                {
                    (() => {
                        switch(params.value) {
                            case "RECORDED":
                                return <CheckCircleIcon />;
                            case "PENDING":
                                return <HourglassEmptyIcon />;
                            default:
                                return null;
                        }
                    })()
                }   
            </Tooltip>
        )
    }
];

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

    return (
        <div style={{ height: 450, width: '100%' }}>
            <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                    <DataGrid rows={data} columns={columns} disableSelectionOnClick/>
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
