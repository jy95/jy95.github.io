import React from 'react'
import {useTranslation} from "react-i18next";
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import { Provider, connect } from 'react-redux'
import i18n from 'i18next';

// snackbars
import { SnackbarProvider } from 'notistack';

// Dark mode
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI components
import Box from '@mui/material/Box';

// languages
import {frFR, enUS} from '@mui/material/locale';

// Components
// @ts-ignore
import Header from "./Home/Header.tsx";
// @ts-ignore
import Menu from "./Home/Menu.tsx"
// @ts-ignore
import Player from "./YTPlayer/Player.tsx";
// @ts-ignore
import GamesGallery from "./GamesView/GamesGallery.tsx";
// @ts-ignore
import Planning from "./Planning/Planning.tsx";
// @ts-ignore
import TestsGallery from "./Tests/TestsGallery.tsx";
// @ts-ignore
import LatestVideosGallery from "./LatestVideos/LatestVideosGallery.tsx";
// @ts-ignore
import { DrawerHeader, Main } from "./Home/Drawer.tsx";

// Redux action
import {
    setThemeColor
} 
// @ts-ignore
from "../actions/themeColor.tsx";

// Languages for Material UI
const materialUI_languages = {
    fr: frFR,
    en: enUS
}

function Root(props) {

    const { store, openMenu } = props;
    const { t } = useTranslation('common');

    return (
        <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
        >
            <Box sx={{ display: 'flex' }}>
                <Provider store={store}>
                    {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                    <Router basename={process.env.PUBLIC_URL} >
                        <Header />
                        <Menu />
                            <Main open={ openMenu } >
                                <DrawerHeader />
                                <Routes>
                                    <Route path="/" element={<Navigate replace to="/games" />} />
                                    <Route path="/games" element={
                                        <React.Suspense fallback={<>{t("common.loading")}</>}>
                                            <GamesGallery />
                                        </React.Suspense>
                                    } />
                                    <Route path="/playlist/:id" element={
                                        <React.Suspense fallback={<>{t("common.loading")}</>}>
                                            <Player />
                                        </React.Suspense>
                                    } />
                                    <Route path="/video/:id" element={
                                        <React.Suspense fallback={<>{t("common.loading")}</>}>
                                            <Player />
                                        </React.Suspense>
                                    } />
                                    <Route path="/planning" element={
                                        <React.Suspense fallback={<>{t("common.loading")}</>}>
                                            <Planning />
                                        </React.Suspense>
                                    } />
                                    <Route path="/tests" element={
                                        <React.Suspense fallback={<>{t("common.loading")}</>}>
                                            <TestsGallery />
                                        </React.Suspense>
                                    } />
                                    <Route path="/latest" element={
                                        <React.Suspense fallback={<>{t("common.loading")}</>}>
                                            <LatestVideosGallery />
                                        </React.Suspense>
                                    } />
                                </Routes>
                            </Main>
                    </Router>
                </Provider>
            </Box>
        </SnackbarProvider>
    )
}

function withThemeProvider(Component) {
    function WithThemeProvider(props) {
        // for theme Color
        const { setThemeColor, themeSettings} = props;
        const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
        const systemColor = prefersDarkMode ? "dark" : "light";

        // for language of the app
        const currentLanguage = i18n.language;

        // Two case handled here :
        // 1) When user comes to the site and have different color that default
        // 2) When user changes on the fly its preferred system color
        React.useEffect(() => {
            if (themeSettings.systemColor !== systemColor) {
                setThemeColor({color: systemColor, mode: "auto"});
            }
        },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [themeSettings.systemColor, systemColor]
        );

        // Prepare theme for possible darkmode
        const theme = React.useMemo(
            () =>
                createTheme({
                    palette: {
                        mode: themeSettings.currentColor,
                    },
                }, materialUI_languages[currentLanguage]),
            [currentLanguage, themeSettings.currentColor],
        );
        return (
            <ThemeProvider theme={theme}>
                <Component {...props} />
            </ThemeProvider>
        );
    }
    return WithThemeProvider;
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    themeSettings: state.themeColor,
    openMenu: state.miscellaneous.drawerOpen
});

const mapDispatchToProps = {
    setThemeColor
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withThemeProvider(Root));