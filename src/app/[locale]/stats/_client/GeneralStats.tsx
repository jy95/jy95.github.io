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
import ExtensionIcon from '@mui/icons-material/Extension';

// Utils
import { useCalcDate, usePrettyDuration } from "./utils";

// Types
import type { statsProperty } from "@/app/api/stats/route";

type Props = {
  stats: statsProperty
}

function GamesStats({stats}: Props) {

  const t = useTranslations();
  const gamesStats = stats.general.games;

  return (
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
          secondary={gamesStats.total}
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
              secondary={gamesStats.total_available}
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
              secondary={gamesStats.total_unavailable}
            />
          </ListItem>
        </List>
      </Suspense>
    </Accordion>
  );
}

function DurationStats({stats}: Props) {

  const t = useTranslations();
  const durationStats = stats.general.duration;

  // hooks calls
  const total_duration = usePrettyDuration(durationStats.total);
  const total_duration_available = usePrettyDuration(durationStats.total_available);
  const total_duration_unavailable = usePrettyDuration(durationStats.total_unavailable);

  return (
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
  );
}

function ChannelCreation({stats}: Props) {
  
  const t = useTranslations();
  const channel_start_date = stats.general.channel_start_date;
  const how_long_since_channel_start = useCalcDate(channel_start_date).result;
  const localDateString = new Date(channel_start_date).toLocaleDateString();
  const how_long_string = t("stats.generalStats.channel_start_date_details", { value: how_long_since_channel_start });
  const human_string = `${localDateString} ${how_long_string}`;

  return (
    <ListItem>
    <ListItemAvatar>
      <Avatar>
        <YouTubeIcon />
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={t("stats.generalStats.channel_start_date")}
      secondary={human_string}
    />
  </ListItem>
  )
}

function DlcsStats({stats}: Props) {

  const t = useTranslations();
  const dlcs = stats.general.dlcs;
  
  return (
    <Accordion key={"total_dlcs"}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={"panel-content_total_dlcs"}
        id={"panel-header_total_dlcs"}
      >
        <ListItemAvatar>
          <Avatar>
            <ExtensionIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={t("stats.generalStats.total_dlcs")}
          secondary={dlcs.total}
        />
      </AccordionSummary>
      <Suspense fallback={null}>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <ExtensionIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t("stats.generalStats.total_dlcs_available")}
              secondary={dlcs.total_available}
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <ExtensionIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t("stats.generalStats.total_dlcs_unavailable")}
              secondary={dlcs.total_unavailable}
            />
          </ListItem>
        </List>
      </Suspense>
    </Accordion>
  );
}

export default function GeneralStats ({stats}: Props) {

  const t = useTranslations();

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
          <GamesStats stats={stats} key={"total_games"} />
          <DlcsStats stats={stats} key={"total_dlcs"} />
          <DurationStats stats={stats} key={"total_duration"} />
          <ChannelCreation stats={stats} key={"channel_creation"} />
        </List>
      </Paper>
    </Grid>
  );
};
