"use client";

// hooks
import { Suspense } from "react";
import { useTranslations } from "next-intl";

// MUI component
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

// Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import YouTubeIcon from "@mui/icons-material/YouTube";

// Utils
import { useCalcDate, usePrettyDuration } from "./utils";

// Types
import type { statsProperty } from "@/app/api/stats/route";

type Props = {
  stats: statsProperty
}

export default function GeneralStats ({stats}: Props) {

  const t = useTranslations();
  const generalStats = stats.general;

  // hooks calls
  const total_duration = usePrettyDuration(generalStats.total_time);
  const total_duration_available = usePrettyDuration(generalStats.total_time_available);
  const total_duration_unavailable = usePrettyDuration(generalStats.total_time_unavailable);
  const how_long_since_channel_start = useCalcDate(generalStats.channel_start_date).result;

  return (
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
                secondary={total_duration}
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
                    secondary={total_duration_available}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <HourglassTopIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t("stats.generalStats.total_duration_unavailable")}
                    secondary={total_duration_unavailable}
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
                generalStats.channel_start_date,
              ).toLocaleDateString()} ${t(
                "stats.generalStats.channel_start_date_details",
                { value: how_long_since_channel_start },
              )}`}
            />
          </ListItem>
        </List>
      </Paper>
    </Grid>
  );
};
