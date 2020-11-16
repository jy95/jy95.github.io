import React from 'react';
import clsx from "clsx";
import {AppBar, CssBaseline, IconButton, Toolbar} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import Switch from '@material-ui/core/Switch';

// Icons for switch
import Brightness5Icon from '@material-ui/icons/Brightness5'; // sun
import Brightness4Icon from '@material-ui/icons/Brightness4'; // moon
import { yellow } from '@material-ui/core/colors';

export default function Header(props) {

    const {drawerOpen, setdrawerOpen, darkMode, setDarkMode, classes} = props;

    const handleDrawerOpen = () => {
        setdrawerOpen(true);
    };

    const handleDarkMode = (event) => {
        setDarkMode(event.target.checked);
    }

    return (
        <React.Fragment>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: drawerOpen,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: drawerOpen,
                        })}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Switch 
                        checked={darkMode}
                        onChange={handleDarkMode}
                        checkedIcon={<Brightness4Icon color="action" />}
                        icon={<Brightness5Icon style={{ color: yellow[500] }}/>}
                        color="default"
                    />
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}