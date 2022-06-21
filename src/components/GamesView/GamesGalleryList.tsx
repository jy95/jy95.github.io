import {Suspense, lazy, useEffect} from "react";
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid";

// Custom
// @ts-ignore
import ReloadWrapper from "../Others/ReloadWrapper.tsx";
// @ts-ignore
import CardEntry from "./CardEntry.tsx";
// @ts-ignore
import type { RootState, AppDispatch } from '../Store.tsx';
import { 
    fetchSeries
} 
// @ts-ignore
from "../../services/seriesSlice.tsx";

const AccordionDetails = lazy(() => import("@mui/material/AccordionDetails"));

const PREFIX = 'GamesGalleryList';

const classes = {
    gameEntry: `${PREFIX}-gameEntry`
};

const StyledSeriesGallery = styled('div')((
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
    }
}));

// The gallery component
function GamesGalleryList(_props) {

    const dispatch: AppDispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.series.loading);
    const error = useSelector((state: RootState) => state.series.error);
    const data = useSelector((state: RootState) => state.series.series);

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchSeries());
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <ReloadWrapper 
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchSeries());}}
            component={
                <StyledSeriesGallery>
                    {
                        data.map(serie => 
                            <Accordion key={serie.name}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={"panel-content" + serie.name}
                                    id={"panel-header" + serie.name}
                                >
                                    <Typography>{serie.name}</Typography>
                                </AccordionSummary>
                                <Suspense fallback={null}>
                                    <AccordionDetails>
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
                                                serie
                                                    .items
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
                                    </AccordionDetails>
                                </Suspense>
                            </Accordion>
                        )
                    }
                </StyledSeriesGallery>
            }
        />
    )
}

export default GamesGalleryList;