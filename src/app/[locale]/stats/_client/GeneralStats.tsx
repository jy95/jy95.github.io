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
import { calcDate, pretty_duration } from "./utils";

// Types
import type { statsProperty } from "@/app/api/stats/route";

type Props = {
  stats: statsProperty
}

export default function GeneralStats ({stats}: Props) {

    const t = useTranslations();
    const generalStats = stats.general;

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
                    secondary={pretty_duration(generalStats.total_time_available)}
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
                    secondary={pretty_duration(generalStats.total_time_unavailable)}
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
                { value: calcDate(generalStats.channel_start_date).result },
              )}`}
            />
          </ListItem>
        </List>
      </Paper>
    </Grid>
  );
};
