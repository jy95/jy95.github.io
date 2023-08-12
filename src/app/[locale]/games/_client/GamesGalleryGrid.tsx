"use client";

// Hooks
import { styled } from '@mui/material/styles';
import { useGetGamesQuery } from "@/redux/services/gamesAPI";

import { useAppSelector } from "@/redux/hooks";

// Style
import Grid from "@mui/material/Grid";

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import GenresSelect from "@/components/GamesView/GenresSelect";
import PlatformSelect from "@/components/GamesView/PlatformSelect";
import TitleFilter from "@/components/GamesView/TitleFilter";

// Types
import type { EnhancedGame } from "@/redux/sharedDefintion";

// Custom component
const PREFIX = 'GamesGalleryGrid';

const classes = {
    gamesCriteria: `${PREFIX}-gamesCriteria`,
    loaderRef: `${PREFIX}-loaderRef`
};

const StyledGamesGallery = styled('div')((
    {
        theme
    }
) => ({
    // inspired by the settings https://www.youtube.com/gaming uses ;)
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
    },
    [`& .${classes.loaderRef}`]: {
        width: "1px",
        height: "1px",
        position: "absolute"
    }
}));

export default function GamesGalleryGrid() {

    // Active filters
    const activeFilters = useAppSelector(
        (state) => state.games.activeFilters
    );

    // Active sorters
    const activeSorters = useAppSelector(
        (state) => state.games.sorters
    );

    // Eager load from now ; later I can reconsider it if data source changes
    const { data, isFetching } = useGetGamesQuery({
        filters: activeFilters,
        sorters: activeSorters,
        limit: -1,
        offset: 0
    });

    // render row
    const renderRow = (game : EnhancedGame) =>
        <Grid 
            key={game.id}
            item
            xs={6}
            md={4}
            lg={1.5}
        >
            <CardEntry game={game}/>
    </Grid>;

    const games = data?.items ?? [];

    return (
        <StyledGamesGallery>
            <Grid
                container
                className={classes.gamesCriteria}
            >
                <Grid item xs={12} md={3}>
                    <PlatformSelect />
                </Grid>
                <Grid item xs={12} md={5}>
                    <GenresSelect />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TitleFilter />
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
                    // render row
                    games.map(renderRow)
                }
            </Grid>
        </StyledGamesGallery>
    )

}