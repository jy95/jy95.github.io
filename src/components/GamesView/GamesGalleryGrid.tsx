import React from "react";
import { styled } from '@mui/material/styles';
import {connect} from 'react-redux';
//import {useTranslation} from "react-i18next";
//import InfiniteScroll from 'react-infinite-scroll-component';
// @ts-ignore
import {get_games /*, scrolling_fetching*/} from "../../actions/games.tsx";

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

    const {loading, error, currentGames /*, totalItems*/} = props;
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
                        overflow="auto"
                    >
                        {/*<InfiniteScroll
                            dataLength={currentGames.length}
                            hasMore={currentGames.length <= totalItems}
                            loader={<div>{t("common.loading")}</div>}
                            next={() => this.props.scrolling_fetching()}
                        >*/}
                        {
                            currentGames.map(renderRow)
                        }
                        {/*</InfiniteScroll>*/}            
                    </Grid>
                </StyledGamesGallery>
            }
        />
    );
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    currentGames: state.games.currentGames,
    totalItems: state.games.totalItems,
    loading: state.games.loading,
    error: state.games.error
});

const mapDispatchToProps = {
    get_games,
    //scrolling_fetching
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamesGalleryGrid);