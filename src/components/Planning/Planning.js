import React from 'react';
import {connect} from 'react-redux';
import { withTranslation } from 'react-i18next';
import {get_scheduled_games} from "../../actions/planning";

// Timeline

// Style
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Tooltip from '@material-ui/core/Tooltip';
import { DataGrid } from '@material-ui/data-grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import CenteredGrid from "../Others/CenteredGrid";

class Viewer extends React.Component {

    componentDidMount() {
        this.props.get_scheduled_games();
    };

    render() {

        const {loading, data, t} = this.props;
        const date_options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

        if (loading) {
            return <CenteredGrid>
                <CircularProgress/>
            </CenteredGrid>
        }

        const columns = [
            {field: "title", headerName: t("planning.columns.title"), width: 270},
            {
                field: "releaseDate", 
                headerName: t("planning.columns.releaseDate"),
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
        ]


        return (
            <div style={{ height: 450, width: '100%' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ flexGrow: 1 }}>
                        <DataGrid rows={data} columns={columns} />
                    </div>
                </div>
            </div>
        )

    }

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
)(
    withTranslation("common")(Viewer)
);
