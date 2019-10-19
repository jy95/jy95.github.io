import React from 'react';
import {connect} from 'react-redux';
import {get_playlists} from "../../actions/playlists";

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from "@material-ui/core/Grid";
import Fab from '@material-ui/core/Fab';
import AutorenewIcon from '@material-ui/icons/Autorenew';

import SnackbarWrapper from "../CustomSnackbar";
import CardsBox from "./CardsBox";

class Viewer extends React.Component {

    componentDidMount() {
        this.props.get_playlists();
    };

    render() {

        if (this.props.loading) {
            return <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{minHeight: '80vh'}}
            >
                <CircularProgress/>
            </Grid>
        }

        if (this.props.error) {

            return <React.Fragment>
                <SnackbarWrapper
                    variant={"error"}
                    message={this.props.error}
                />
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    style={{minHeight: '80vh'}}
                >
                    <Fab
                        variant="extended"
                        size="medium"
                        color="primary"
                        aria-label="reload"
                        onClick={() => {
                            this.props.get_playlists();
                        }}
                    >
                        <AutorenewIcon/>
                        Recharger
                    </Fab>
                </Grid>
            </React.Fragment>;
        }

        return (
            <CardsBox data={this.props.data}/>
        )

    }

}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    data: state.playlists.playlists,
    loading: state.playlists.loading,
    error: state.playlists.error,
});

const mapDispatchToProps = {
    get_playlists
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Viewer);