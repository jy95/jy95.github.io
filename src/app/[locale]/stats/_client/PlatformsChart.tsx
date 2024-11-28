"use client";

// hooks
import { useTranslations } from "next-intl";

// MUI component
import Typography from "@mui/material/Typography";
import Grid from '@mui/material-pigment-css/Grid';
import Paper from "@mui/material/Paper";

import { LineChart } from '@mui/x-charts/LineChart';

// Types
import type { statsProperty } from "@/app/api/stats/route";

type Props = {
  stats: statsProperty;
};

export default function PlatformsChart({ stats }: Props) {
  const t = useTranslations();

  const platformsData = stats.platforms;

  if (platformsData.length === 0) {
    return <></>; // return nothing if data is empty
  }

  return (
    <Grid 
      size={{
        xs: 12,
        md: 4
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
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          {t("stats.platformsChart.title")}
        </Typography>
        <LineChart 
          dataset={platformsData}
          xAxis={[
            {
              id: 'Platform',
              dataKey: 'platform',
              scaleType: 'band',
              valueFormatter: (platform) => platform
            }
          ]}
          series={[
            {
              id: 'total_available',
              label: t("stats.genresChart.total_available"),
              dataKey: "total_available",
              stack: 'total',
              area: true,
              showMark: false
            },
            {
              id: 'total_unavailable',
              label: t("stats.genresChart.total_unavailable"),
              dataKey: "total_unavailable",
              stack: 'total',
              area: true,
              showMark: false
            },
          ]}
          hideLegend
        />
      </Paper>
    </Grid>
  );
}
