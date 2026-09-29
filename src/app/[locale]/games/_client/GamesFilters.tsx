import type { GameFilters } from '@/types/gamesFilters';
import { useTranslations } from "next-intl";

// MUI
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

// Custom
import GenresSelect from "@/features/games/components/GenresSelect";
import PlatformSelect from "@/features/games/components/PlatformSelect";
import TitleFilter from "@/features/games/components/TitleFilter";
import SortSelect from "@/features/games/components/SortSelect";

type Props = {
    filters: GameFilters;
    onChange: (changes: Partial<GameFilters>) => void;
};

export default function GamesFilters({ filters, onChange }: Props) {
    const t = useTranslations("gamesLibrary");

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                <SearchIcon aria-label={t("filtersButtonLabel")} />
                {t("filtersButtonLabel")}
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TitleFilter value={filters.title ?? ""} onChange={title => onChange({ title })} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <PlatformSelect value={filters.platform} onChange={platform => onChange({ platform })} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <GenresSelect value={filters.genres ?? []} onChange={genres => onChange({ genres })} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <SortSelect value={filters.sort} onChange={sort => onChange({ sort })} />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
}
