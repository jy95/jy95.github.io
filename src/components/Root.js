import React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { Provider, connect } from 'react-redux'
import i18n from 'i18next';

// Dark mode
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

// MUI components
import Box from '@material-ui/core/Box';

// languages
import {frFR, enUS} from '@material-ui/core/locale';

// Components
import Header from "./Home/Header";
import Menu from "./Home/Menu"
import Player from "./YTPlayer/Player";
import GamesGallery from "./GamesView/GamesGallery";
import Planning from "./Planning/Planning";
import TestsGallery from "./Tests/TestsGallery";
import LatestVideosGallery from "./LatestVideos/LatestVideosGallery";
import { DrawerHeader, Main } from "./Home/Drawer";

// Redux action
import {setThemeColor} from "../actions/themeColor";

// Languages for Material UI
const materialUI_languages = {
    fr: frFR,
    en: enUS
}

function Root(props) {

    const { store, openMenu } = props;

    return (
        <Box sx={{ display: 'flex' }}>
            <Provider store={store}>
                {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                <Router basename={process.env.PUBLIC_URL} >
                    <Header />
                    <Menu />
                        <Main open={ openMenu } >
                            <DrawerHeader />
                            <Route exact path="/" render={() => <Redirect to="/games" />}/>
                            <Route path="/games" component={GamesGallery} />
                            <Route path="/playlist/:id" component={Player} />
                            <Route path="/video/:id" component={Player} />
                            <Route path="/planning" component={Planning} />
                            <Route path="/tests" component={TestsGallery} />
                            <Route path="/latest" component={LatestVideosGallery} />
                        </Main>
                </Router>
            </Provider>
        </Box>
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
        )
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