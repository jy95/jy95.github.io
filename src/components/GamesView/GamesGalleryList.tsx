"use client";

import { Suspense, lazy, useEffect } from "react";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid";

// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import { fetchSeries, selectSeries } from "@/redux/services/seriesSlice";

const AccordionDetails = lazy(() => import("@mui/material/AccordionDetails"));

// The gallery component
function GamesGalleryList(_props : {[key: string | number | symbol] : any}) {

    const dispatch = useAppDispatch();
    const {
        loading,
        error,
        series: data
    } = useAppSelector((state) => selectSeries(state));

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchSeries());
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <div>
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
                                                        key={game.id}
                                                        item 
                                                        xs={6}
                                                        md={4}
                                                        lg={1.5}
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
        </div>
    )
}

export default GamesGalleryList;