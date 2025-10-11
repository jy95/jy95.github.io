"use client";

// hooks
import { useTranslations } from "next-intl";

// MUI component
import Typography from "@mui/material/Typography";
import Grid from '@mui/material/Grid';
import Paper from "@mui/material/Paper";

import { BarChart } from '@mui/x-charts/BarChart';

// Types
import type { statsProperty } from "@/app/api/stats/route";

import type { AppConfig } from 'next-intl';

/**
 * Accesses the keys of the 'gamesGenres' object defined within
 * the 'Messages' type of next-intl's augmented AppConfig.
 */
type GamesLibraryMessages = AppConfig['Messages']['gamesLibrary'];

// 🔑 This is the direct type you want:
export type GameGenreId = keyof GamesLibraryMessages['gamesGenres'];

type Props = {
  stats: statsProperty
}

export default function GenresChart({stats}: Props) {

    const t = useTranslations();

    // for genre chart
    const genresData = stats.genres;

    if (genresData.length === 0) {
        return <></>;
    }

    return (
        <Grid 
          size={{
            xs: 12,
            md: 8
          }}
        >
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 360,
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              {t("stats.genresChart.title")}
            </Typography>
            <BarChart 
              dataset={genresData}
              series={[
                {
                  dataKey: "total_available",
                  stack: 'availablility',
                  label: t("stats.genresChart.total_available")
                },
                {
                  dataKey: "total_unavailable",
                  stack: 'availablility',
                  label: t("stats.genresChart.total_unavailable")
                }
              ]}
              xAxis={[
                {
                  scaleType: 'band',
                  dataKey: "id",
                  valueFormatter: (id : GameGenreId) => t(`gamesLibrary.gamesGenres.${id}`)
                }
              ]}
              hideLegend
            />
          </Paper>
        </Grid>
    );
}