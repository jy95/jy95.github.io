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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Types
import type { statsProperty } from "@/app/api/stats/route";

type Props = {
  stats: statsProperty;
};

export default function PlatformsChart({ stats }: Props) {
  const t = useTranslations();
  const currentColor = useAppSelector((state) => state.themeColor.currentColor);

  const strokeColor = currentColor === "dark" ? "white" : "dark";
  const platformsData = stats.platforms.map((platform) => ({
    key: platform.platform,
    total_available: platform.total_available,
    total_unavailable: platform.total_unavailable,
  }));

  if (platformsData.length === 0) {
    return <></>; // return nothing if data is empty
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
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          {t("stats.platformsChart.title")}
        </Typography>
        <ResponsiveContainer>
          <AreaChart data={platformsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" stroke={strokeColor} />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: currentColor }} />
            <Legend />
            <Area
              type="monotone"
              dataKey="total_available"
              name={t("stats.genresChart.total_available")}
              stroke="#1fa134"
              fill="#1fa134"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="total_unavailable"
              stroke="#8884d8"
              fill="#8884d8"
              name={t("stats.genresChart.total_unavailable")}
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  );
}
