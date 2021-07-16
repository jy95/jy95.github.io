import React from "react";
import {connect} from 'react-redux';
import clsx from "clsx";
import {useTranslation} from "react-i18next";

// Material UI
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

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

function Menu(props) {

    const {container, open, classes} = props;

    const handleDrawerClose = () => {
        props.setDrawerOpen(false);
    };

    return (
        <Drawer
            container={container}
            variant={"permanent"}
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            })}
            classes={{
                paper: clsx({
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                }),
            }}
            open={open}
        >
            <div className={classes.toolbar}>
                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
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