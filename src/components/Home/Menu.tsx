import { useMemo, forwardRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";

// Material UI
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// Router
import {
    Link,
    useMatch
} from "react-router-dom"

// icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExtensionIcon from '@mui/icons-material/Extension';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Styled components
// @ts-ignore
import { Drawer, DrawerHeader } from "./Drawer.tsx";

// Redux 
// @ts-ignore
import { drawerOpen } from "../../services/miscellaneousSlice.tsx";
// @ts-ignore
import type { RootState, AppDispatch } from '../Store.tsx';

// List Item
function ListItemLink(props) {
    const { icon, primary, to } = props;
    const { t } = useTranslation('common');
    const entry_label = t(primary);

    const matchUrl = useMatch(to) !== null;

    const renderLink = useMemo(
        () =>
            forwardRef((linkProps, _ref) => (
                // With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
                // See https://github.com/ReactTraining/react-router/issues/6056
                <Link to={to} {...linkProps} />
            )),
        [to],
    );

    return useMemo(
        () => 
            <ListItem disablePadding>
                <ListItemButton component={renderLink} selected={matchUrl}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={entry_label} />
                </ListItemButton>
            </ListItem>,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [matchUrl]
    )
};

// entries
const ENTRIES = [
    {
        "icon": <SportsEsportsIcon />,
        "primary": "main.menuEntries.gamesKey",
        "to": "/games"
    },
    {
        "icon": <ScheduleIcon />,
        "primary": "main.menuEntries.planningKey",
        "to": "/planning"
    },
    {
        "icon": <ExtensionIcon />,
        "primary": "main.menuEntries.testsKey",
        "to": "/tests"  
    },
    {
        "icon": <VideoLibraryIcon />,
        "primary": "main.menuEntries.latestVideosKey",
        "to": "/latest"
    }
]

// Main component
function Menu(props) {

    const {container} = props;

    const dispatch: AppDispatch = useDispatch();
    const isdrawerOpen = useSelector((state: RootState) => state.miscellaneous.drawerOpen);

    const handleDrawerClose = () => {
        dispatch(drawerOpen(false));
    };

    return (
        <Drawer
            container={container}
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
                    ENTRIES.map(entry => <ListItemLink {...entry} key={entry.to} />)
                }
            </List>
        </Drawer>
    );
}

export default Menu;