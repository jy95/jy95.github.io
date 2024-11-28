"use client";

// hooks
import { Suspense } from "react";
import { useTranslations } from "next-intl";

// MUI component
import Grid from '@mui/material-pigment-css/Grid';
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
import type { JSX } from 'react'

type Props = {
  stats: statsProperty
}

function StatAccordion({
  id,
  title,
  generalText,
  defaultIcon,
  items,
}: {
  id: string;
  title: string;
  generalText: string | number,
  defaultIcon: JSX.Element;
  items: { label: string; value: string | number; icon?: JSX.Element }[];
}) {
  return (
    <Accordion key={id}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-content_${id}`}
        id={`panel-header_${id}`}
      >
        <ListItemAvatar>
          <Avatar>{defaultIcon}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={title} secondary={generalText} />
      </AccordionSummary>
      <Suspense fallback={null}>
        <List>
          {items.map((item, index) => (
            <ListItem key={`${id}_item_${index}`}>
              <ListItemAvatar>
                <Avatar>{item.icon || defaultIcon}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={item.label} secondary={item.value} />
            </ListItem>
          ))}
        </List>
      </Suspense>
    </Accordion>
  );
}

function GamesStats({ stats }: Props) {
  const t = useTranslations();
  const games = stats.general.games;

  return (
    <StatAccordion
      id="total_games"
      title={t("stats.generalStats.total_games")}
      generalText={games.total}
      defaultIcon={<SportsEsportsIcon />}
      items={[
        { label: t("stats.generalStats.total_games_available"), value: games.total_available },
        { label: t("stats.generalStats.total_games_unavailable"), value: games.total_unavailable },
      ]}
    />
  );
}

function DurationStats({ stats }: Props) {
  const t = useTranslations();
  const duration = stats.general.duration;

  return (
    <StatAccordion
      id="total_duration"
      title={t("stats.generalStats.total_duration")}
      generalText={usePrettyDuration(duration.total)}
      defaultIcon={<HourglassFullIcon />}
      items={[
        {
          label: t("stats.generalStats.total_duration_available"),
          value: usePrettyDuration(duration.total_available),
          icon: <HourglassBottomIcon />, // Specific icon for this item
        },
        {
          label: t("stats.generalStats.total_duration_unavailable"),
          value: usePrettyDuration(duration.total_unavailable),
          icon: <HourglassTopIcon />, // Specific icon for this item
        },
      ]}
    />
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

function DlcsStats({ stats }: Props) {
  const t = useTranslations();
  const dlcs = stats.general.dlcs;

  return (
    <StatAccordion
      id="total_dlcs"
      title={t("stats.generalStats.total_dlcs")}
      generalText={dlcs.total}
      defaultIcon={<ExtensionIcon />}
      items={[
        { label: t("stats.generalStats.total_dlcs_available"), value: dlcs.total_available },
        { label: t("stats.generalStats.total_dlcs_unavailable"), value: dlcs.total_unavailable },
      ]}
    />
  );
}

export default function GeneralStats ({stats}: Props) {

  const t = useTranslations();

  return (
    <Grid 
      size={{
        xs: 12
      }}
    >
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
