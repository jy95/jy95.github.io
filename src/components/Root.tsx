import { useMemo, useEffect, Suspense, lazy} from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'
import { useTranslation } from "react-i18next";

// snackbars
import { SnackbarProvider } from 'notistack';

// Dark mode
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI components
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// hooks
import { useAsyncMemo } from "../hooks/useAsyncMemo";
import { useAppDispatch, useAppSelector } from "../hooks/typedRedux";

import Menu from "./Home/Menu"
import { DrawerHeader, Main } from "./Home/Drawer";

// Redux action
import { themeColor } from "../services/themeColorSlice";

// Selectors
import { selectCurrentColor, selectCurrentSystemColor } from '../services/themeColorSlice';
import { selectOpenMenu } from '../services/miscellaneousSlice';

// Components
const Header = lazy(() => import("./Home/Header"));
const Player = lazy(() => import("./YTPlayer/Player"));
const GamesGallery = lazy(() => import("./GamesView/GamesGallery"));
const Planning = lazy(() => import("./Planning/Planning"));
const TestsGallery = lazy(() => import("./Tests/TestsGallery"));
const LatestVideosGallery = lazy(() => import("./LatestVideos/LatestVideosGallery"));
const StatsPage = lazy(() => import("./Stats/StatsPage"));

function Root(_props : { [key: string | number | symbol] : any }) {

    const openMenu = useAppSelector((state) => selectOpenMenu(state));

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
                        {/* @ts-ignore Mui has some issue sending attr to children*/}
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
                                    <Suspense fallback={<LinearProgress />}>
                                        <Player />
                                    </Suspense>
                                } />
                                <Route path="/video/:id" element={
                                    <Suspense fallback={<LinearProgress />}>
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
                                <Route path="/stats" element={
                                    <Suspense fallback={<LinearProgress />}>
                                        <StatsPage />
                                    </Suspense>
                                } />
                            </Routes>
                        </Main>
                </Router>
            </Box>
        </SnackbarProvider>
    )
}

function withThemeProvider(Component : any) {
    function WithThemeProvider(_props : { [key: string | number | symbol] : any }) {
        // for theme Color
        const dispatch = useAppDispatch();
        const currentColor = useAppSelector((state) => selectCurrentColor(state));
        const currentSystemColor = useAppSelector((state) => selectCurrentSystemColor(state));
        const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
        const systemColor = prefersDarkMode ? "dark" : "light";

        // for language of the app
        const { i18n } = useTranslation('common');
        const currentLanguage = i18n.language as 'fr' | 'en';

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
        const muiLanguage = useAsyncMemo(async () => {
            switch(currentLanguage) {
                case 'fr':
                    const { frFR : language} = await import(/* webpackExports: "frFR" */ "@mui/material/locale");
                    return language;
                // English is by default built-in in @mui package, so no need to include
                default:
                    return {};
            }
        }, [currentLanguage], {} as any);

        const theme = useMemo(
            () =>
                createTheme({
                    palette: {
                        mode: currentColor,
                    },
                }, muiLanguage),
            [muiLanguage, currentColor],
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