import React from 'react';
import { connect } from 'react-redux';
import { get_playlists } from "../../actions/playlists";

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from "@material-ui/core/Grid";
import SnackbarWrapper from "../CustomSnackbar";

import CardsGrid from "./CardsGrid";

class Viewer extends React.Component {

    componentDidMount() {
        this.props.get_playlists();
    };

    render() {

        if (this.props.loading){
            return <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: '80vh' }}
            >
                <CircularProgress />
            </Grid>
        }

        if (this.props.error) {
            return <SnackbarWrapper
                variant={"error"}
                message={this.props.error}
            />
        }

        return (
            <CardsGrid data={this.props.data}/>
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