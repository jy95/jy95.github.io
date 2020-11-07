import React from "react";
import {connect} from 'react-redux';
import {get_games} from "../../actions/games";

// Style

import Grid from "@material-ui/core/Grid";

import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import AutorenewIcon from '@material-ui/icons/Autorenew';

// Custom

import CenteredGrid from "../Others/CenteredGrid";
import SnackbarWrapper from "../Others/CustomSnackbar";
import CardEntry from "./CardEntry";
import GamesSorters from "./GamesSorters";

// The gallery component
class GamesGallery extends React.Component {

    componentDidMount() {
        this.props.get_games();
    };

    render() {
        const {loading, error, data} = this.props;

        if (loading) {
            return <CenteredGrid>
                <CircularProgress/>
            </CenteredGrid>
        }

        if (error) {
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
            <>
                <GamesSorters />
                <Grid
                    container
                >
                    {
                        data.map(
                            game => 
                                <Grid key={game.playlistId ?? game.videoId} item xs>
                                    <CardEntry game={game}/>
                                </Grid>
                        )
                    }
                </Grid>
            </>
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
)(GamesGallery);