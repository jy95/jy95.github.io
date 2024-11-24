// MUI
import Grid from "@mui/material/Grid";

// Custom
import GenresSelect from "@/components/GamesView/GenresSelect";
import PlatformSelect from "@/components/GamesView/PlatformSelect";
import TitleFilter from "@/components/GamesView/TitleFilter";

export default function GamesFilters() {

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={6} lg={4}>
                <TitleFilter />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
                <PlatformSelect />
            </Grid>
            <Grid item xs={12} md={12} lg={4}>
                <GenresSelect />
            </Grid>
      </Grid>
    )
}