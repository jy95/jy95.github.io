"use client";

// Next js
import dynamic from 'next/dynamic'

// Hooks
import { useGetDLCsQuery } from "@/redux/services/dlcsAPI";

// MUI component
import Grid from '@mui/material/Grid';
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

    const { data, error, isLoading } = useGetDLCsQuery();

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
        <>
            {
                data.map(game => 
                    <Accordion key={game.name}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={"panel-content" + game.name}
                            id={"panel-header" + game.name}
                        >
                            <Typography>{game.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid
                                container
                                spacing={1}
                                rowSpacing={1}
                            >
                                {
                                    game
                                        .items
                                        .map(dlc => 
                                                <Grid 
                                                    key={dlc.id}
                                                    size={{
                                                        xs: 6,
                                                        md: 4,
                                                        lg: 1.5
                                                    }}
                                                >
                                                    <CardEntry game={dlc}/>
                                                </Grid>
                                        )
                                }
                            </Grid> 
                        </AccordionDetails>
                    </Accordion>
                )
            }
        </>
    )
}

export default GamesGalleryList;