import Box from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  chevronSx, fullBadgeSx, fullIconSx, iconWrapperSx, miniBadgeSx, miniCaptionSx, miniIconSx,
} from "./navigationItemStyles";

import type { ReactNode } from "react";

export type ItemContentProps = {
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  hint?: string;
  hintId: string;
  hasChildren: boolean;
  expanded: boolean;
};

function ExpandChevron({ isMini, expanded }: { isMini: boolean; expanded: boolean }) {
  return <ExpandMoreIcon aria-hidden="true" sx={chevronSx(isMini, expanded)} />;
}

/** Collapsed drawer: icon with an overlaid badge, caption underneath. */
export function MiniItemContent({ title, icon, badge, hasChildren, expanded }: ItemContentProps) {
  return (
    <>
      <Box sx={miniIconSx}>
        <ListItemIcon sx={iconWrapperSx}>
          <Box component="span" aria-hidden="true">{icon}</Box>
          {badge && <Box sx={miniBadgeSx}>{badge}</Box>}
        </ListItemIcon>
        <Typography variant="caption" sx={miniCaptionSx}>{title}</Typography>
      </Box>
      {hasChildren && <ExpandChevron isMini expanded={expanded} />}
    </>
  );
}

/** Expanded drawer: icon, title with hint, trailing badge. */
export function FullItemContent({ title, icon, badge, hint, hintId, hasChildren, expanded }: ItemContentProps) {
  return (
    <>
      <Box sx={fullIconSx}>
        <ListItemIcon sx={iconWrapperSx}>
          <Box component="span" aria-hidden="true">{icon}</Box>
        </ListItemIcon>
      </Box>
      <ListItemText primary={title} secondary={hint} sx={{ ml: 1.2, minWidth: 0 }}
        slotProps={{
          primary: { sx: { whiteSpace: "normal", overflowWrap: "anywhere" } },
          secondary: { id: hintId, sx: { whiteSpace: "normal", overflowWrap: "anywhere", fontSize: 12 } },
        }} />
      {badge && <Box component="span" sx={fullBadgeSx}>{badge}</Box>}
      {hasChildren && <ExpandChevron isMini={false} expanded={expanded} />}
    </>
  );
}
