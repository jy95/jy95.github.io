import React from "react";
import {connect} from 'react-redux';
import {useTranslation} from "react-i18next";

// Material UI
import Divider from '@material-ui/core/Divider';
import MuiDrawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import { styled } from '@material-ui/styles';

// Router
import {
    Link,
    useRouteMatch
} from "react-router-dom"

// icons
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ExtensionIcon from '@material-ui/icons/Extension';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

// Redux action
import {setDrawerOpen} from "../../actions/miscellaneous"

// List Item
function ListItemLink(props) {
    const { icon, primary, to } = props;
    const { t } = useTranslation('common');
    const entry_label = t(primary);

    const matchUrl = useRouteMatch(to) !== null;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef((linkProps, ref) => (
                // With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
                // See https://github.com/ReactTraining/react-router/issues/6056
                <Link to={to} {...linkProps} innerRef={ref} />
            )),
        [to],
    );

    return (
        <Tooltip title={entry_label} aria-label={primary}>
            <ListItem button component={renderLink} selected={matchUrl}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={entry_label} />
            </ListItem>
        </Tooltip>
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

// drawerWidth
const drawerWidth = 240;

// styled drawer header
const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

// Drawer Mixins
const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
});
  
const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(${theme.spacing(9)} + 1px)`,
    },
});

// styled Drawer
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }),
    }),
);

// Main component
function Menu(props) {

    const {container, open} = props;

    const handleDrawerClose = () => {
        props.setDrawerOpen(false);
    };

    return (
        <Drawer
            container={container}
            variant={"permanent"}
            open={open}
        >
            <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
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
    )
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    open: state.miscellaneous.drawerOpen
});

const mapDispatchToProps = {
    setDrawerOpen
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Menu);