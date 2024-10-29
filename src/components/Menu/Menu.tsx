"use client";

// Router
import { forwardRef, useMemo } from "react";

// https://next-intl-docs.vercel.app/docs/routing/navigation
import { Link, usePathname } from "@/i18n/routing";

// Hooks
import {useTranslations} from 'next-intl';

// Material UI
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExtensionIcon from '@mui/icons-material/Extension';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LinkIcon from '@mui/icons-material/Link';

// Styled components
import { Drawer, DrawerHeader } from "./Drawer";

// Redux 
import { drawerOpen } from "@/redux/features/miscellaneousSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// Links props
import type { LinkBaseProps as MuiProps } from "@mui/material"
import type { JSX } from 'react'

type menuEntryTranslationKey = 'gamesKey' | 'planningKey' | 'testsKey' | 'latestVideosKey' | 'stats' | 'backlog' | "links";
type MUILinkProps = MuiProps & any;

// List Item
function ListItemLink(props : {
    icon: JSX.Element;
    path: string;
    primary: `${menuEntryTranslationKey}`;
}) {
    const { icon, primary, path } = props;
    const t = useTranslations('header.menuEntries');
    const pathname = usePathname()
    const entry_label = t(primary);

    const isActive = pathname.startsWith(path);

    const CustomLink = useMemo(
        () => forwardRef(
            function OwnLink(linkProps : MUILinkProps, _ref) {
                return (
                    <Link {...linkProps} href={path} />
                )
            }
        ),
        [path]
    );


    return (
        <ListItem disablePadding>
            <ListItemButton component={CustomLink} selected={isActive} href={path} >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={entry_label} />
            </ListItemButton>
        </ListItem>
    );
};

// entries
const ENTRIES : {
    icon: JSX.Element,
    path: string,
    primary: `${menuEntryTranslationKey}`
}[] = [
    {
        icon: <SportsEsportsIcon />,
        primary: "gamesKey",
        path: "/games"
    },
    {
        icon: <ScheduleIcon />,
        primary: "planningKey",
        path: "/planning"
    },
    {
        icon: <ExtensionIcon />,
        primary: "testsKey",
        path: "/tests"  
    },
    {
        icon: <QueryStatsIcon />,
        primary: "stats",
        path: "/stats"
    },
    {
        icon: <HourglassEmptyIcon />,
        primary: "backlog",
        path: "/backlog"
    },
    {
        icon: <LinkIcon />,
        primary: "links",
        path: "/links"
    }
]

// Main component
export default function Menu() {

    const dispatch = useAppDispatch();
    const isdrawerOpen = useAppSelector((state) => state.miscellaneous.drawerOpen);

    const handleDrawerClose = () => {
        dispatch(drawerOpen(false));
    };

    return (
        <Drawer
            variant={"permanent"}
            open={isdrawerOpen}
        >
            <DrawerHeader>
                <IconButton onClick={handleDrawerClose} size="large" aria-label="Menu" >
                    <ChevronLeftIcon />
                </IconButton>                
            </DrawerHeader>
            <Divider />
            <List>
                {
                    ENTRIES.map(entry => <ListItemLink {...entry} key={entry.path} />)
                }
            </List>
        </Drawer>
    );
}