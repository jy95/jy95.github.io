"use client";

// Router
import { forwardRef, useMemo } from "react";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

// Styled components
import { Drawer, DrawerHeader } from "./Drawer";

// Redux 
import { drawerOpen } from "@/redux/features/miscellaneousSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// Links props
import type { LinkProps } from "next/link";
import type { LinkBaseProps as MuiProps } from "@mui/material"

type menuEntryTranslationKey = 'gamesKey' | 'planningKey' | 'testsKey' | 'latestVideosKey' | 'stats';
type MUILinkProps = LinkProps & MuiProps;

// List Item
function ListItemLink(props : {
    icon: JSX.Element;
    path: string;
    primary: `${menuEntryTranslationKey}`;
    lang: string;
}) {
    const { icon, primary, path, lang } = props;
    const t = useTranslations('main.menuEntries');
    const pathname = usePathname()
    const entry_label = t(primary);

    const href = `${path}`;
    const isActive = pathname.startsWith(href)

    const CustomLink = useMemo(
        () => forwardRef(
            function OwnLink(linkProps : MUILinkProps, _ref) {
                return (
                    <Link locale={lang} {...linkProps} />
                )
            }
        ),
        [lang]
    );


    return (
        <ListItem disablePadding>
            <ListItemButton component={CustomLink} selected={isActive} href={href} >
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
    }
]

type Props = {
    lang: string
}

// Main component
function Menu({ lang }: Props) {

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
                    ENTRIES.map(entry => <ListItemLink {...entry} key={entry.path} lang={lang} />)
                }
            </List>
        </Drawer>
    );
}

export default Menu;