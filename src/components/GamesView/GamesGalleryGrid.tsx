import React from "react";
import { styled } from '@mui/material/styles';
import {connect} from 'react-redux';
// @ts-ignore
import {get_games} from "../../actions/games.tsx";

// Style

import Grid from "@mui/material/Grid";

// Custom
// @ts-ignore
import ReloadWrapper from "../Others/ReloadWrapper.tsx";
// @ts-ignore
import CardEntry from "./CardEntry.tsx";
// @ts-ignore
import GamesSorters from "./GamesSorters.tsx";
// @ts-ignore
import GenresSelect from "./GenresSelect.tsx";
// @ts-ignore
import PlatformSelect from "./PlatformSelect.tsx";
// @ts-ignore
import TitleFilter from "./TitleFilter.tsx";

const PREFIX = 'GamesGalleryGrid';

const classes = {
    gameEntry: `${PREFIX}-gameEntry`,
    gamesCriteria: `${PREFIX}-gamesCriteria`
};

const StyledGamesGallery = styled('div')((
    {
        theme
    }
) => ({
    // inspired by the settings https://www.youtube.com/gaming uses ;)
    [`& .${classes.gameEntry}`]: {
        // 2 items on [0, sm]
        [theme.breakpoints.only('xs')]: {
            flexBasis: "calc((100% / 2) - 1%)"
        },
        // 4 items on [sm, md[
        [theme.breakpoints.only('sm')]: {
            flexBasis: "calc((100% / 4) - 1%)"
        },
        // 8 items on [md, infinity]
        [theme.breakpoints.up('md')]: {
            flexBasis: "calc((100% / 8) - 1%)"
        },
    },
    [`& .${classes.gamesCriteria}`]: {
        display: "flex",
        [theme.breakpoints.down('md')]: {
            flexDirection: "column",
            rowGap: "8px"
        },
        [theme.breakpoints.up('md')]: {
            flexDirection: "row",
            justifyContent: "flex-end"
        }
    }
}));

// To check if platform match search critiria
const matches_platform_search = (platform) => (game) => game.platform === platform;

// To check if title match search criteria (insensitive search)
const matches_title_search = (searchTitle) => (game) => game.title.search(new RegExp(searchTitle, 'i')) >= 0;

// To check if two arrays contains at least one element in common
const at_least_one_in_common = (requestedGenres) => (game) => requestedGenres.some(v => game.genres.indexOf(v.key) >= 0);

// The gallery component
function GamesGalleryGrid(props) {

    const {loading, error, data, filters, sortFunction} = props;

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_games();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

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
        <ReloadWrapper 
            loading={loading}
            error={error}
            reloadFct={() => {props.get_games();}}
            component={
                <StyledGamesGallery>
                    <Grid
                        container
                        className={classes.gamesCriteria}
                    >
                        <Grid item xs={12} md={1}>
                            <GamesSorters />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <PlatformSelect variant="standard" />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <GenresSelect variant="standard" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TitleFilter games={currentGames} />
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
                </StyledGamesGallery>
            }
        />
    );
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
)(GamesGalleryGrid);