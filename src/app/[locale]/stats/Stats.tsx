"use client";

// hooks
import { Suspense, useEffect } from "react";
import {useTranslations} from 'next-intl';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchStats, selectStats } from "@/redux/services/statsSlice";

// MUI component
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

// Icons
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
} from "recharts";

// type
import type { Genre as GenreValue } from "@/redux/services/sharedDefintion";



export default function StatsPage() {
    const t = useTranslations();
    const dispatch = useAppDispatch();
    const stats = useAppSelector((state) => selectStats(state));
    const currentColor = useAppSelector( (state) => state.themeColor.currentColor )

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchStats());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // for genre chart
    const genresData = stats.genres.map(s => ({
        ...s,
        category: t(`gamesLibrary.gamesGenres.${s.key as GenreValue}` as const)
    }));

    // StackedAreaChart : https://recharts.org/en-US/examples/StackedAreaChart
    // StackedBarChart : https://recharts.org/en-US/examples/StackedBarChart

    // for platform chart
    const platformsData = stats.platforms;

    // for generals line
    const generalStats = stats.general;

    const strokeColor = (currentColor === "dark") ? "white": "dark"; 

// Inspired by https://blog.bitsrc.io/calculate-the-difference-between-two-2-dates-e1d76737c05a
// My version includes some improvements in the codebase & changes to fit my needs
function calcDate(date1: string) {
  //new date instance
  const dt_date1 = new Date(date1);
  const dt_date2 = new Date();

  //Get the Timestamp
  const date1_time_stamp = dt_date1.getTime();
  const date2_time_stamp = dt_date2.getTime();

  let calc;

  //Check which timestamp is greater
  if (date1_time_stamp > date2_time_stamp) {
    calc = new Date(date1_time_stamp - date2_time_stamp);
  } else {
    calc = new Date(date2_time_stamp - date1_time_stamp);
  }
  //Retrieve the date, month and year
  const calcFormatTmp =
    calc.getDate() + "-" + (calc.getMonth() + 1) + "-" + calc.getFullYear();
  //Convert to an array and store
  const calcFormat = calcFormatTmp.split("-");
  //Subtract each member of our array from the default date
  const days_passed = Number(Math.abs(Number(calcFormat[0])) - 1);
  const months_passed = Number(Math.abs(Number(calcFormat[1])) - 1);
  const years_passed = Number(Math.abs(Number(calcFormat[2])) - 1970);

  //Convert to days and sum together
  const total_days = years_passed * 365 + months_passed * 30.417 + days_passed;
  const total_secs = total_days * 24 * 60 * 60;
  const total_mins = total_days * 24 * 60;
  const total_hours = total_days * 24;
  const total_weeks = total_days >= 7 ? total_days / 7 : 0;

  //display result with custom text
  const result = [
    t("common.dates.years", { count: years_passed }),
    t("common.dates.months", { count: months_passed }),
    t("common.dates.days", { count: days_passed }),
  ].join(" ");

  //return the result
  return {
    total_days: Math.round(total_days),
    total_weeks: Math.round(total_weeks),
    total_hours: Math.round(total_hours),
    total_minutes: Math.round(total_mins),
    total_seconds: Math.round(total_secs),
    result: result.trim(),
  };
}

// Pretty print duration
function pretty_duration(
  contentDuration: {
    hours: number;
    minutes: number;
    seconds: number;
  }
) {
  return [
    t("common.dates.hours", { count: contentDuration.hours }),
    t("common.dates.minutes", { count: contentDuration.minutes }),
    t("common.dates.seconds", { count: contentDuration.seconds }),
  ].join(" ");
}

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} lg={12}>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            {t("stats.generalStats.title")}
          </Typography>
          <List>
            <Accordion key={"total_games"}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={"panel-content_total_games"}
                id={"panel-header_total_games"}
              >
                <ListItemAvatar>
                  <Avatar>
                    <SportsEsportsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={t("stats.generalStats.total_games")}
                  secondary={generalStats.total}
                />
              </AccordionSummary>
              <Suspense fallback={null}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <SportsEsportsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={t("stats.generalStats.total_games_available")}
                      secondary={generalStats.total_available}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <SportsEsportsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={t("stats.generalStats.total_games_unavailable")}
                      secondary={generalStats.total_unavailable}
                    />
                  </ListItem>
                </List>
              </Suspense>
            </Accordion>

            <Accordion key={"total_duration"}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={"panel-content_total_duration"}
                id={"panel-header_total_duration"}
              >
                <ListItemAvatar>
                  <Avatar>
                    <HourglassFullIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={t("stats.generalStats.total_duration")}
                  secondary={pretty_duration(generalStats.total_time)}
                />
              </AccordionSummary>
              <Suspense fallback={null}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <HourglassBottomIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={t("stats.generalStats.total_duration_available")}
                      secondary={pretty_duration(
                        generalStats.total_time_available
                      )}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <HourglassTopIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={t(
                        "stats.generalStats.total_duration_unavailable"
                      )}
                      secondary={pretty_duration(
                        generalStats.total_time_unavailable
                      )}
                    />
                  </ListItem>
                </List>
              </Suspense>
            </Accordion>

            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <YouTubeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t("stats.generalStats.channel_start_date")}
                secondary={`${new Date(
                  generalStats.channel_start_date
                ).toLocaleDateString()} ${t(
                  "stats.generalStats.channel_start_date_details",
                  { value: calcDate(generalStats.channel_start_date).result }
                )}`}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
      {genresData.length > 0 && (
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
      )}
      {platformsData.length > 0 && (
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
      )}
    </Grid>
  );
}
