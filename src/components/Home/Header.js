import React from 'react';
import {connect} from 'react-redux';
import clsx from "clsx";
import {useTranslation} from "react-i18next";

// React Material UI
import {AppBar, CssBaseline, IconButton, Toolbar} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import Switch from '@material-ui/core/Switch';

// Icons for switch
import Brightness5Icon from '@material-ui/icons/Brightness5'; // sun
import Brightness4Icon from '@material-ui/icons/Brightness4'; // moon
import { yellow } from '@material-ui/core/colors';

// Icons for languages
import SvgIcon from '@material-ui/core/SvgIcon';
import Tooltip from '@material-ui/core/Tooltip';

// Redux action
import {setThemeColor} from "../../actions/themeColor";

// Custom icons
import languages_with_icons from "./HeaderLanguages";

function Header(props) {

    const [t, i18n] = useTranslation('common');
    const {drawerOpen, setdrawerOpen, classes} = props;

    const handleDrawerOpen = () => {
        setdrawerOpen(true);
    };

    const handleDarkMode = (event) => {
        const color = (event.target.checked) ? "dark" : "light";
        props.setThemeColor({color, mode: "manual"});
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
                        checked={props.isDark}
                        onChange={handleDarkMode}
                        checkedIcon={<Brightness4Icon color="action" />}
                        icon={<Brightness5Icon style={{ color: yellow[500] }}/>}
                        color="default"
                    />
                    <div style={{flexGrow: 1}}/>
                    <div>
                        {
                            Object
                                .keys(languages_with_icons)
                                .map(language =>
                                    <Tooltip title={t("header.languages." + language)} key={language}>
                                        <IconButton
                                            onClick={() => i18n.changeLanguage(language)}
                                        >
                                            <SvgIcon>
                                                {languages_with_icons[language]}
                                            </SvgIcon>
                                        </IconButton>
                                    </Tooltip>                   
                                )
                        }
                    </div>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    isDark: state.themeColor.currentColor === "dark",
});

const mapDispatchToProps = {
    setThemeColor
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);