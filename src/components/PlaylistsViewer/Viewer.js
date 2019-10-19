import React from 'react';
import {connect} from 'react-redux';
import {get_playlists} from "../../actions/playlists";

import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import AutorenewIcon from '@material-ui/icons/Autorenew';

import CenteredGrid from "../Others/CenteredGrid";
import SnackbarWrapper from "../Others/CustomSnackbar";
import CardsBox from "./CardsBox";

class Viewer extends React.Component {

    componentDidMount() {
        this.props.get_playlists();
    };

    render() {

        if (this.props.loading) {
            return <CenteredGrid>
                <CircularProgress/>
            </CenteredGrid>
        }

        if (this.props.error) {

            return <React.Fragment>
                <SnackbarWrapper
                    variant={"error"}
                    message={this.props.error}
                />
                <CenteredGrid>
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
                </CenteredGrid>
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