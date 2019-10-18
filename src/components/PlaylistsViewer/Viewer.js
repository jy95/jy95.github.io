import React from 'react';
import { connect } from 'react-redux';
import { get_playlists } from "../../actions/playlists";

import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import CardsGrid from "./CardsGrid";

class Viewer extends React.Component {

    componentDidMount() {
        this.props.get_playlists();
    };

    render() {

        if (this.props.loading){
            return <CircularProgress />
        }

        if (this.props.error) {
            return <Snackbar>
                <SnackbarContent
                    aria-describedby="client-snackbar"
                    message={
                        <span id="client-snackbar">
                            {this.props.error}
                        </span>
                    }
                />
            </Snackbar>
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