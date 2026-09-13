// MUI components for a list row with an avatar and text.
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";

import type { ReactNode } from "react";

type Props = {
    icon: ReactNode;
    avatarSx?: object;
    primary: ReactNode;
    secondary?: ReactNode;
};

export function AvatarListRow({ icon, avatarSx, primary, secondary }: Props) {
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar variant={avatarSx ? "circular" : undefined} sx={avatarSx}>{icon}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={primary} secondary={secondary} />
        </ListItem>
    );
}