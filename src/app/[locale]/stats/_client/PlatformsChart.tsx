"use client";

// hooks
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/hooks";

// MUI component
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

// Recharts components
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Legend,
  } from "recharts";

// Types
import type { statsProperty } from "@/app/api/stats/route";

type Props = {
  stats: statsProperty
}

export default function PlatformsChart({stats} : Props) {

    const t = useTranslations();
    const currentColor = useAppSelector((state) => state.themeColor.currentColor);

    const strokeColor = currentColor === "dark" ? "white" : "dark";
    const platformsData = stats.platforms
        .map(platform => ({
            key: platform.platform,
            ...platform
        }));

    if (platformsData.length === 0) {
        return <></>; 
    }

    return (
        <Grid item xs={12} md={4} lg={4}>
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
              {t("stats.platformsChart.title")}
            </Typography>
            <ResponsiveContainer>
              <RadarChart outerRadius={90} data={platformsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="key" stroke={strokeColor} />
                <Radar
                  name={t("stats.platformsChart.total_available")}
                  dataKey="total_available"
                  stroke="#1fa134"
                  fill="#1fa134"
                  fillOpacity={0.6}
                />
                <Radar
                  name={t("stats.platformsChart.total_unavailable")}
                  dataKey="total_unavailable"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
    );
}