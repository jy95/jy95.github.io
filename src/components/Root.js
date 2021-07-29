import React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { Provider, connect } from 'react-redux'
import i18n from 'i18next';

// Dark mode
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createTheme, ThemeProvider, styled } from '@material-ui/core/styles';

// Redux action
import {setThemeColor} from "../actions/themeColor";

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

import Grid from '@material-ui/core/Grid';

// Languages for Material UI
const materialUI_languages = {
    fr: frFR,
    en: enUS
}

// styles
const PREFIX = 'Root';
const classes = {
    root: `${PREFIX}-root`,
    content: `${PREFIX}-content`,
    toolbar: `${PREFIX}-toolbar`
}
const StyledRoot = styled('div')((theme) => ({
    [`&.${classes.root}`]: {
        display: 'flex',
    },
    [`& .${classes.content}`]: {
        flexGrow: 1,
        padding: theme.spacing(3)
    },
    [`& .${classes.toolbar}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    }
}));

function Root(props) {

    const { store } = props;

    return (
        <StyledRoot className={classes.root}>
            <Provider store={store}>
                {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                <Router basename={process.env.PUBLIC_URL} >
                    <Header />
                    <Menu />
                    <main className={classes.content}>
                        <div className={classes.toolbar} />
                        <Grid container>
                            <Route exact path="/" render={() => <Redirect to="/games" />}/>
                            <Route path="/games" component={GamesGallery} />
                            <Route path="/playlist/:id" component={Player} />
                            <Route path="/video/:id" component={Player} />
                            <Route path="/planning" component={Planning} />
                            <Route path="/tests" component={TestsGallery} />
                            <Route path="/latest" component={LatestVideosGallery} />
                        </Grid>
                    </main>
                </Router>
            </Provider>
        </StyledRoot>
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
    themeSettings: state.themeColor
});

const mapDispatchToProps = {
    setThemeColor
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withThemeProvider(Root));