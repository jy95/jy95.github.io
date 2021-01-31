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
import GenresSelect from "./GenresSelect";
import PlatformSelect from "./PlatformSelect";
import TitleFilter from "./TitleFilter";

// To check if platform match search critiria
const matches_platform_search = (platform) => (game) => game.platform === platform;

// To check if title match search criteria (insensitive search)
const matches_title_search = (searchTitle) => (game) => game.title.search(new RegExp(searchTitle, 'i')) >= 0;

// To check if two arrays contains at least one element in common
const at_least_one_in_common = (requestedGenres) => (game) => requestedGenres.some(v => game.genres.indexOf(v.key) >= 0);

// To dynamically change the number of items depending of browser
const useStyles = makeStyles((theme) => ({
    // inspired by the settings https://www.youtube.com/gaming uses ;)
    gameEntry: {
        // 2 items on [0, sm]
        [theme.breakpoints.only('xs')]: {
            "flex-basis": "calc((100% / 2) - 1%)"
        },
        // 4 items on [sm, md[
        [theme.breakpoints.only('sm')]: {
            "flex-basis": "calc((100% / 4) - 1%)"
        },
        // 8 items on [md, infinity]
        [theme.breakpoints.up('md')]: {
            "flex-basis": "calc((100% / 8) - 1%)"
        },
    },
    gamesCriteria: {
        display: "flex",
        [theme.breakpoints.down('sm')]: {
            "flex-direction": "column",
            "row-gap": "8px"
        },
        [theme.breakpoints.up('md')]: {
            "flex-direction": "row",
            "justify-content": "flex-end"
        }
    }
}));    

// The gallery component
function GamesGallery(props) {

    const {loading, error, data, filters, sortFunction} = props;
    const classes = useStyles(props);

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_games();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

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
    
    // if provided platform filter
    if (filters.platform.length !== 0) {
        filter_conditions.push(matches_platform_search(filters.platform));
    }

    // if provided title filter
    if (filters.title.length !== 0) {
        filter_conditions.push(matches_title_search(filters.title));
    }

    // if provided genre filter
    if (filters.genres.length !== 0) {
        filter_conditions.push(at_least_one_in_common(filters.genres));
    }

    // Apply filters
    const currentGames = data
        .filter(game => filter_conditions.every(condition => condition(game)))
        .sort(sortFunction);

    return (
        <>
            <Grid
                container
                className={classes.gamesCriteria}
            >
                <Grid item xs={12} md={4}>
                    <TitleFilter games={currentGames} />
                </Grid>
                <Grid item xs={12} md={2}>
                    <PlatformSelect />
                </Grid>
                <Grid item xs={12} md={5}>
                    <GenresSelect />
                </Grid>
                <Grid item xs={12} md={1}>
                    <GamesSorters />
                </Grid>
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
                    currentGames
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
        title: state.games.filters.selected_title,
        platform: state.games.filters.selected_platform,
    },
    sortFunction: state.games.sorters.currentSortFunction,
    loading: state.games.loading,
    error: state.games.error
});

const mapDispatchToProps = {
    get_games
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamesGallery);