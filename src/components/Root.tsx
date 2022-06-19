import { useMemo, useEffect, Suspense, lazy} from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import i18n from 'i18next';

// snackbars
import { SnackbarProvider } from 'notistack';

// Dark mode
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI components
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';

// languages
import {frFR, enUS} from '@mui/material/locale';

// @ts-ignore
import Menu from "./Home/Menu.tsx"
// @ts-ignore
import { DrawerHeader, Main } from "./Home/Drawer.tsx";

// Redux action
// @ts-ignore
import { themeColor } from "../services/themeColorSlice.tsx";
// @ts-ignore
import { RootState, AppDispatch } from './Store.tsx';

// Components
// @ts-ignore
const Header = lazy(() => import("./Home/Header.tsx"));
// @ts-ignore
const Player = lazy(() => import("./YTPlayer/Player.tsx"));
// @ts-ignore
const GamesGallery = lazy(() => import("./GamesView/GamesGallery.tsx"));
// @ts-ignore
const Planning = lazy(() => import("./Planning/Planning.tsx"));
// @ts-ignore
const TestsGallery = lazy(() => import("./Tests/TestsGallery.tsx"));
// @ts-ignore
const LatestVideosGallery = lazy(() => import("./LatestVideos/LatestVideosGallery.tsx"));

// Languages for Material UI
const materialUI_languages = {
    fr: frFR,
    en: enUS
}

function Root(_props) {

    const openMenu = useSelector((state: RootState) => state.miscellaneous.drawerOpen);

    return (
        <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
        >
            <Box sx={{ display: 'flex' }}>
                {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                <Router basename={process.env.PUBLIC_URL} >
                    <Header />
                    <Menu />
                        <Main open={ openMenu } >
                            <DrawerHeader />
                            <Routes>
                                <Route path="/" element={<Navigate replace to="/games" />} />
                                <Route path="/games" element={
                                    <Suspense fallback={<LinearProgress />}>
                                        <GamesGallery />
                                    </Suspense>
                                } />
                                <Route path="/playlist/:id" element={
                                    <Suspense fallback={<Skeleton variant="rectangular" />}>
                                        <Player />
                                    </Suspense>
                                } />
                                <Route path="/video/:id" element={
                                    <Suspense fallback={<Skeleton variant="rectangular" />}>
                                        <Player />
                                    </Suspense>
                                } />
                                <Route path="/planning" element={
                                    <Suspense fallback={<LinearProgress />}>
                                        <Planning />
                                    </Suspense>
                                } />
                                <Route path="/tests" element={
                                    <Suspense fallback={<LinearProgress />}>
                                        <TestsGallery />
                                    </Suspense>
                                } />
                                <Route path="/latest" element={
                                    <Suspense fallback={<LinearProgress />}>
                                        <LatestVideosGallery />
                                    </Suspense>
                                } />
                            </Routes>
                        </Main>
                </Router>
            </Box>
        </SnackbarProvider>
    )
}

function withThemeProvider(Component) {
    function WithThemeProvider(props) {
        // for theme Color
        const dispatch: AppDispatch = useDispatch();
        const currentColor = useSelector((state: RootState) => state.themeColor.currentColor);
        const currentSystemColor = useSelector((state: RootState) => state.themeColor.systemColor);
        const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
        const systemColor = prefersDarkMode ? "dark" : "light";

        // for language of the app
        const currentLanguage = i18n.language;

        // Two case handled here :
        // 1) When user comes to the site and have different color that default
        // 2) When user changes on the fly its preferred system color
        useEffect(() => {
            if (currentSystemColor !== systemColor) {
                dispatch(themeColor({color: systemColor, mode: "auto"}));
            }
        },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [currentSystemColor, currentColor]
        );

        // Prepare theme for possible darkmode
        const theme = useMemo(
            () =>
                createTheme({
                    palette: {
                        mode: currentColor,
                    },
                }, materialUI_languages[currentLanguage]),
            [currentLanguage, currentColor],
        );
        return (
            <ThemeProvider theme={theme}>
                <Component />
            </ThemeProvider>
        );
    }
    return WithThemeProvider;
}

export default withThemeProvider(Root);