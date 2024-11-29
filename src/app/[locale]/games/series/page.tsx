"use client";

// Next js
import dynamic from 'next/dynamic'

// Hooks
import { useGetSeriesQuery } from "@/redux/services/seriesAPI";

// MUI component
import Grid from '@mui/material/Grid2';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
        return (
            <div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} style={{ marginBottom: '15px' }}>
                        <Skeleton variant="rectangular" width="100%" height={50} />
                    </div>
                ))}
          </div>
        );
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
                                                    size={{
                                                        xs: 6,
                                                        md: 4,
                                                        lg: 1.5
                                                    }}
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