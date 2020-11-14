import React from "react";
import {connect} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
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
import GamesFilters from "./GamesFilters";

// To check if title match search criteria (insensitive search)
const matches_title_search = (searchTitle) => (game) => game.title.search(new RegExp(searchTitle, 'i'));

// To check if two arrays contains at least one element in common
const at_least_one_in_common = (requestedGenres) => (game) => requestedGenres.some(v => game.genres.indexOf(v.key) >= 0);

// To dynamically change the number of items depending of browser

const useStyles = makeStyles((theme) => ({
    gameEntry: {
        [theme.breakpoints.only('xs')]: {
            "flex-basis": "calc((100% / 2) - 1%)"
        },
        [theme.breakpoints.only('sm')]: {
            "flex-basis": "calc((100% / 4) - 1%)"
        },
        [theme.breakpoints.only('md')]: {
            "flex-basis": "calc((100% / 8) - 1%)"
        },
        [theme.breakpoints.up('lg')]: {
            "flex-basis": "calc((100% / 10) - 1%)"
        },
    }
}));    

// The gallery component
function GamesGallery(props) {

    const {loading, error, data, filters, sortFunction} = props;
    const classes = useStyles(props);

    if (props.data.length === 0){
        props.get_games();
    }

    if (loading) {
        return <CenteredGrid>
            <CircularProgress/>
        </CenteredGrid>
    }

    if (error) {
        return <>
            <SnackbarWrapper
                variant={"error"}
                message={error}
            />
            <CenteredGrid>
                <Fab
                    variant="extended"
                    size="medium"
                    color="primary"
                    aria-label="reload"
                    onClick={() => {
                        props.get_games();
                    }}
                >
                    <AutorenewIcon/>
                    Recharger
                </Fab>
            </CenteredGrid>
        </>;
    }

    // prepare filter checks
    let filter_conditions = [];
    
    // if provided title filter
    if (filters.title.length !== 0) {
        filter_conditions.push(matches_title_search(filters.title))
    }

    // if provided genre filter
    if (filters.genres.length !== 0) {
        filter_conditions.push(at_least_one_in_common(filters.genres))
    }

    return (
        <>
            <Grid
                container
                display="flex"
                //wrap="wrap"
                //direction="row"
                //justify="flex-end"
            >
                <GamesFilters />
                <GamesSorters />
            </Grid>
    
            <Grid
                container
                spacing={1}
                style={
                    {
                        rowGap: "15px"
                    }
                }
            >
                {
                    data
                        .filter(game => filter_conditions.every(condition => condition(game)))
                        .sort(sortFunction)
                        .map(game => 
                                <Grid 
                                    key={game.playlistId ?? game.videoId} 
                                    item 
                                    className={classes.gameEntry}
                                >
                                    <CardEntry game={game}/>
                                </Grid>
                        )
                }
            </Grid>
        </>
    )
    
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    data: state.games.games,
    filters: {
        genres: state.games.filters.selected_genres,
        title: state.games.filters.selected_title
    },
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