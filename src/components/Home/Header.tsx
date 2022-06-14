import React from 'react';
import {connect} from 'react-redux';
import {useTranslation} from "react-i18next";

// React Material UI
import {CssBaseline, IconButton, Toolbar} from "@mui/material";
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

// Icons for switch
import Brightness5Icon from '@mui/icons-material/Brightness5'; // sun
import Brightness4Icon from '@mui/icons-material/Brightness4'; // moon
import { yellow } from '@mui/material/colors';

// Icons for languages
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';

// Redux actions
// @ts-ignore
import {setThemeColor} from "../../actions/themeColor.tsx";
// @ts-ignore
import {setDrawerOpen} from "../../actions/miscellaneous.tsx"

// Custom icons
// @ts-ignore
import languages_with_icons from "./HeaderLanguages.tsx";

// styled AppBar
const drawerWidth = 240;
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
}));

// main component
function Header(props) {

    const [t, i18n] = useTranslation('common');
    const {drawerOpen} = props;

    const handleDrawerOpen = () => {
        props.setDrawerOpen(true);
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
                open={drawerOpen}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(drawerOpen && { display: 'none' }),
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Switch 
                        checked={props.isDark}
                        onChange={handleDarkMode}
                        checkedIcon={<Brightness4Icon color="action" />}
                        icon={<Brightness5Icon style={{ color: yellow[500] }}/>}
                        inputProps={{ 'aria-label': 'Mode' }}
                        color="default"
                    />
                    <div style={{flexGrow: 1}}/>
                    <div>
                        {
                            Object
                                .keys(languages_with_icons)
                                .map(language =>
                                    <Tooltip title={t("header.languages." + language)} key={language}>
                                        <IconButton onClick={() => i18n.changeLanguage(language)} size="large">
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
    );
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    isDark: state.themeColor.currentColor === "dark",
    drawerOpen: state.miscellaneous.drawerOpen
});

const mapDispatchToProps = {
    setThemeColor,
    setDrawerOpen
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);