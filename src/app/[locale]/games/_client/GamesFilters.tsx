// MUI
import Grid from '@mui/material/Grid2';

// Custom
import GenresSelect from "@/components/GamesView/GenresSelect";
import PlatformSelect from "@/components/GamesView/PlatformSelect";
import TitleFilter from "@/components/GamesView/TitleFilter";

export default function GamesFilters() {

    return (
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
    )
}