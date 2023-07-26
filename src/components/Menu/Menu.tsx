"use client";

// Router
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, forwardRef } from "react";
import { useTranslation } from "react-i18next";

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
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

// Styled components
import { Drawer, DrawerHeader } from "./Drawer";

// Redux 
import { drawerOpen } from "@/redux/services/miscellaneousSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

type menuEntryTranslationKey = 'gamesKey' | 'planningKey' | 'testsKey' | 'latestVideosKey' | 'stats';

// List Item
function ListItemLink(props : {
    [key: string | number | symbol] : any;
    href: string;
    primary: `main.menuEntries.${menuEntryTranslationKey}`;
}) {
    const { icon, primary, href } = props;
    const { t } = useTranslation('common');
    const pathname = usePathname()
    const entry_label = t(primary);

    const isActive = pathname.startsWith(href)
    console.log(href)
    console.log(isActive)

    const renderLink = useMemo(
        () => forwardRef(
            function CustomLink(linkProps, _ref) {
                return <Link href={`${href}`} {...linkProps} />
            }
        ),
        [href]
    )

    return useMemo(
        () => 
            <ListItem disablePadding>
                <ListItemButton component={renderLink} selected={isActive}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={entry_label} />
                </ListItemButton>
            </ListItem>,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isActive]
    )
};

// entries
const ENTRIES : {
    icon: JSX.Element,
    href: string,
    primary: `main.menuEntries.${menuEntryTranslationKey}`
}[] = [
    {
        icon: <SportsEsportsIcon />,
        primary: "main.menuEntries.gamesKey",
        href: "/games"
    },
    {
        icon: <ScheduleIcon />,
        primary: "main.menuEntries.planningKey",
        href: "/planning"
    },
    {
        icon: <ExtensionIcon />,
        primary: "main.menuEntries.testsKey",
        href: "/tests"  
    },
    {
        icon: <VideoLibraryIcon />,
        primary: "main.menuEntries.latestVideosKey",
        href: "/latest"
    },
    {
        icon: <QueryStatsIcon />,
        primary: "main.menuEntries.stats",
        href: "/stats"
    }
]

// Main component
function Menu() {

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
            {/*
            <List>
                {
                    ENTRIES.map(entry => <ListItemLink {...entry} key={entry.href} />)
                }
            </List>
            */}
        </Drawer>
    );
}

export default Menu;