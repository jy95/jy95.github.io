"use client";

// Next js 
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
import languages_with_icons from "./HeaderLanguages";

// Redux
import { drawerOpen } from "@/redux/features/miscellaneousSlice";
import { themeColor } from "@/redux/features/themeColorSlice";

// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {useTranslations} from 'next-intl';

// styled AppBar
const drawerWidth = 240;
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
// @ts-ignore : open does exist in MUI
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
function Header() {

    const t = useTranslations('header.languages');
    const pathname = usePathname()
    const dispatch = useAppDispatch();
    const isdrawerOpen = useAppSelector((state) => state.miscellaneous.drawerOpen);
    const currentColor = useAppSelector((state) => state.themeColor.currentColor);

    const handleDrawerOpen = () => {
        dispatch(drawerOpen(true));
    };

    const handleDarkMode = (event : any) => {
        const color = (event.target.checked) ? "dark" : "light";
        dispatch(themeColor({color, mode: "manual"}));
    }

    return (
        <>
            <CssBaseline />
            <AppBar
                position="fixed"
                // @ts-ignore : open does exist in MUI
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
                                .map( language =>
                                    <Tooltip title={t(`${language as 'fr' | 'en'}` as const)} key={language}>
                                        <Link locale={language} href={pathname}>
                                            <IconButton size="large">
                                                <SvgIcon>
                                                    {languages_with_icons[language as 'fr' | 'en']}
                                                </SvgIcon>
                                            </IconButton>
                                        </Link>
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