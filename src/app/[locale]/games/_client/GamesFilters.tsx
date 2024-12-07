import { lazy, Suspense } from "react";

// MUI
import Grid from '@mui/material/Grid2';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';

// Custom
const GenresSelect = lazy(() => import("@/components/GamesView/GenresSelect"));
const PlatformSelect = lazy(() => import("@/components/GamesView/PlatformSelect"));
const TitleFilter = lazy(() => import("@/components/GamesView/TitleFilter"));

export default function GamesFilters() {

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                <SearchIcon aria-label="Options"/>
                {"Options"}
            </AccordionSummary>
            <AccordionDetails>
                <Suspense fallback={<CircularProgress />}>
                    <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <TitleFilter />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <PlatformSelect />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <GenresSelect />
                        </Grid>
                    </Grid>
                </Suspense>
            </AccordionDetails>
      </Accordion>
    );
}