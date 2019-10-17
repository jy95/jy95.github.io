import React from 'react';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    List
} from '@material-ui/core';

// icons
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import ScheduleIcon from '@material-ui/icons/Schedule';


export const ENTRIES = (
    <List>
        <ListItem button>
            <ListItemIcon>
                <PlaylistPlayIcon />
            </ListItemIcon>
            <ListItemText primary="Jeux" />
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <ScheduleIcon />
            </ListItemIcon>
            <ListItemText primary="Plannifié" />
        </ListItem>
    </List>
);