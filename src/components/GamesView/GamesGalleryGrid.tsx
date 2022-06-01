import React from "react";
import { styled } from '@mui/material/styles';
import {connect} from 'react-redux';
import useInfiniteLoader from 'react-use-infinite-loader';
//import {useTranslation} from "react-i18next";
// @ts-ignore
import {get_games, fetch_scrolling_games, generate_sort_function, generate_filter_function} from "../../actions/games.tsx";

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

// The gallery component
function GamesGalleryGrid(props) {

    const {
        loading, 
        error, 
        games, 
        canLoadMore,
        scrollLoading,
        initialLoad,
        currentItemCount,
        filtersFunction,
        currentSortFunction,
        fetch_scrolling_games
    } = props;
    //const { t } = useTranslation('common');

    // on mount, load data (only once)
    React.useEffect(() => {
        props.get_games();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // render row
    const renderRow = (game) =>
        <Grid 
            key={game.playlistId ?? game.videoId} 
            item 
            className={classes.gameEntry}
        >
            <CardEntry game={game}/>
    </Grid>;

    const loadMoreGames = React.useCallback( () => {
        fetch_scrolling_games();
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const { loaderRef } = useInfiniteLoader({
        loadMore: loadMoreGames,

        // If this is false useInfiniteLoader no longer invokes `loadMore` when it usually does
        canLoadMore: canLoadMore,

        // Not used in this example. Used if you already load page 0 on mount, you can tell
        // useInfiniteLoader what page to begin loading more from
        startFromPage: 1,

        // Used for if your data fetching library fetches page 0 and renders it when the component
        // loads, to use this just have a state flag that you set to false once the initial load
        // from your data fetching lib has happened.
        initialise: initialLoad === false,

        // Passed directly to the intersection observer https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Intersection_observer_options
        // Set to 0px top margin to allow you to see the loading effect easier in this demo
        rootMargin: "0px 0px 0px 0px",

        // Passed directly to the intersection observer https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Intersection_observer_options
        //threshold: 0,
        debug: false,
    });

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
                            <TitleFilter games={games} />
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
                            games
                                // remove the ones that doesn't match filter criteria
                                .filter(filtersFunction)
                                // sort them in user preference
                                .sort(currentSortFunction)
                                // 
                                .slice(0, currentItemCount)
                                // render row
                                .map(renderRow)
                        }
                    </Grid>
                    {!scrollLoading && <div ref={loaderRef as any} className="loaderRef" />}
                </StyledGamesGallery>
            }
        />
    );
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    currentItemCount: state.games.currentItemCount,
    canLoadMore: state.games.currentItemCount <= state.games.totalItems,
    currentSortFunction: generate_sort_function(state.games.sorters),
    filtersFunction: generate_filter_function(state.games.activeFilters),
    games: state.games.games,
    scrollLoading: state.games.scrollLoading,
    initialLoad: state.games.initialLoad,
    loading: state.games.loading,
    error: state.games.error
});

const mapDispatchToProps = {
    get_games,
    fetch_scrolling_games
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamesGalleryGrid);