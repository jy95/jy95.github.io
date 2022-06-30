import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";

// React Material UI
import {CssBaseline, IconButton, Toolbar} from "@mui/material";
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

// Icons for switch
import Brightness5Icon from '@mui/icons-material/Brightness5'; // sun
import Brightness4Icon from '@mui/icons-material/Brightness4'; // moon

// Icons for languages
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';

// Custom icons
// @ts-ignore
import languages_with_icons from "./HeaderLanguages.tsx";

// Redux
// @ts-ignore
import { drawerOpen } from "../../services/miscellaneousSlice.tsx";
// @ts-ignore
import { themeColor } from "../../services/themeColorSlice.tsx";
// @ts-ignore
import type { RootState, AppDispatch } from '../Store.tsx';

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
function Header(_props) {

    const {t, i18n} = useTranslation('common');
    const dispatch: AppDispatch = useDispatch();
    const isdrawerOpen = useSelector((state: RootState) => state.miscellaneous.drawerOpen);
    const currentColor = useSelector((state: RootState) => state.themeColor.currentColor);

    const handleDrawerOpen = () => {
        dispatch(drawerOpen(true));
    };

    const handleDarkMode = (event) => {
        const color = (event.target.checked) ? "dark" : "light";
        dispatch(themeColor({color, mode: "manual"}));
    }

    return (
        <>
            <CssBaseline />
            <AppBar
                position="fixed"
                open={isdrawerOpen}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(isdrawerOpen && { display: 'none' }),
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Switch 
                        checked={currentColor === "dark"}
                        onChange={handleDarkMode}
                        checkedIcon={<Brightness4Icon color="action" />}
                        icon={<Brightness5Icon style={{ color: '#ffeb3b' }}/>}
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
        </>
    );
}

export default Header;