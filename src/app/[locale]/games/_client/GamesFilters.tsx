import type { GameFilters } from '@/types/gamesFilters';
import { lazy, Suspense } from "react";

// MUI
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';

// Custom
const GenresSelect = lazy(() => import("@/features/games/components/GenresSelect"));
const PlatformSelect = lazy(() => import("@/features/games/components/PlatformSelect"));
const TitleFilter = lazy(() => import("@/features/games/components/TitleFilter"));

type Props = {
    filters: GameFilters;
    onChange: (changes: Partial<GameFilters>) => void;
};

export default function GamesFilters({ filters, onChange }: Props) {

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
                            <TitleFilter value={filters.title ?? ""} onChange={title => onChange({ title })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <PlatformSelect value={filters.platform} onChange={platform => onChange({ platform })} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <GenresSelect value={filters.genres ?? []} onChange={genres => onChange({ genres })} />
                        </Grid>
                    </Grid>
                </Suspense>
            </AccordionDetails>
      </Accordion>
    );
}