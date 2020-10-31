import React from 'react';
import {connect} from 'react-redux';
import {get_games} from "../../actions/games";

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
                            this.props.get_games();
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
    data: state.games.games,
    loading: state.games.loading,
    error: state.games.error,
});

const mapDispatchToProps = {
    get_games
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Viewer);