// MUI
import Grid from "@mui/material/Grid";
import useMediaQuery from '@mui/material/useMediaQuery';

// Custom
import GenresSelect from "@/components/GamesView/GenresSelect";
import PlatformSelect from "@/components/GamesView/PlatformSelect";
import TitleFilter from "@/components/GamesView/TitleFilter";

export default function GamesFilters() {

    // Tweak display of filters according screen size
    const onSmallScreen = useMediaQuery( (theme : any) => theme.breakpoints.down('md'));

    return (
        <Grid
            container
            sx={{
                display: "flex",
                flexDirection: (onSmallScreen) ? "column" : "row",
                rowGap: (onSmallScreen) ? "8px" : undefined,
                justifyContent: (onSmallScreen) ? "flex-end" : undefined
            }}
        >
            <Grid item xs={12} md={4}>
                <TitleFilter />
            </Grid>
            <Grid item xs={12} md={3}>
                <PlatformSelect />
            </Grid>
            <Grid item xs={12} md={5}>
                <GenresSelect />
            </Grid>
        </Grid>
    )
}