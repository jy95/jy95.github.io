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
class GamesGallery extends React.PureComponent {

    componentDidMount() {
        this.props.get_games();
    };

    render() {
        const {loading, error, data, sortFunction} = this.props;

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
                <Grid
                    container
                    display="flex"
                    wrap="wrap"
                    direction="row"
                    justify="flex-end"
                >
                    <GamesSorters />
                </Grid>
        
                <Grid
                    container
                >
                    {
                        data
                            .sort(sortFunction)
                            .map(game => 
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
    sortFunction: state.games.sorters.currentSortFunction,
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