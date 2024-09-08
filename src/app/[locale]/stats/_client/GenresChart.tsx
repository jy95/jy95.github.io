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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Types
import type { statsProperty } from "@/app/api/stats/route";

type Props = {
  stats: statsProperty
}

export default function GenresChart({stats}: Props) {

    const t = useTranslations();
    const currentColor = useAppSelector((state) => state.themeColor.currentColor);

    const strokeColor = currentColor === "dark" ? "white" : "dark";
      // for genre chart
    const genresData = stats.genres.map(genre => ({
        key: genre.id,
        category: t(`gamesLibrary.gamesGenres.${genre.id}` as any),
        ...genre
    }));

    if (genresData.length === 0) {
        return <></>;
    }

    return (
        <Grid item xs={12} md={8} lg={8}>
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
            <ResponsiveContainer>
              <BarChart data={genresData}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="category" stroke={strokeColor} />
                <YAxis stroke={strokeColor} />
                <Tooltip contentStyle={{ backgroundColor: currentColor }} />
                <Bar
                  type="monotone"
                  dataKey="total_available"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name={t("stats.genresChart.total_available")}
                />
                <Bar
                  type="monotone"
                  dataKey="total_unavailable"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name={t("stats.genresChart.total_unavailable")}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
    );
}