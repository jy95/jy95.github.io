"use client";

// Next js
import dynamic from 'next/dynamic'

// Hooks
import { useGetSeriesQuery } from "@/redux/services/seriesAPI";

// Mui component
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid";

// Custom
const CardEntry = dynamic(() => import('@/components/GamesView/CardEntry'), { ssr: false });
const AccordionDetails = dynamic(() => import('@mui/material/AccordionDetails'), { ssr: false });

// The gallery component
function GamesGalleryList() {

    const { data, error, isLoading } = useGetSeriesQuery();

    if (error) {
        return <>Something bad happened</>;
    }
    
    if (isLoading) {
        return <>Loading</>;
    }

    if (!data) {
        return null;
    }

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
                    </Accordion>
                )
            }
        </div>
    )
}

export default GamesGalleryList;