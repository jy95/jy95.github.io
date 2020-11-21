import React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { Provider } from 'react-redux'
import {connect} from 'react-redux';

// Dark mode
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

// Redux action
import {setThemeColor} from "../actions/themeColor";

// Components
import Header from "./Home/Header";
import Menu from "./Home/Menu"
import Player from "./YTPlayer/Player";
import GamesGallery from "./GamesView/GamesGallery";
import Planning from "./Planning/Planning";

import Grid from '@material-ui/core/Grid';
import basicStyle from "./Home/styles"

function Root(props) {

    const classes = basicStyle();
    const { store, setThemeColor, themeSettings} = props;
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const systemColor = prefersDarkMode ? "dark" : "light";

    // for drawer
    const [open, setOpen] = React.useState(false);

    // Two case handled here :
    // 1) When user comes to the site and have different color that default
    // 2) When user changes on the fly its preferred system color
    React.useEffect(() => {
        if (themeSettings.systemColor !== systemColor) {
            setThemeColor({color: systemColor, mode: "auto"});
        }
    }, [themeSettings.systemColor, systemColor, setThemeColor]);

    // Prepare theme for possible darkmode
    const theme = React.useMemo(
        () =>
          createMuiTheme({
            palette: {
              type: themeSettings.currentColor,
            },
          }),
        [themeSettings.currentColor],
      );

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Provider store={store}>
                    {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                    <Router basename={process.env.PUBLIC_URL} >
                        <Header drawerOpen={open} setdrawerOpen={setOpen} classes={classes}/>
                        <Menu open={open} setOpen={setOpen} classes={classes}/>
                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            <Grid container>
                                <Route exact path="/" render={() => <Redirect to="/games" />}/>
                                <Route path="/games" component={GamesGallery} />
                                <Route path="/playlist/:id" component={Player} />
                                <Route path="/video/:id" component={Player} />
                                <Route path="/planning" component={Planning} />
                            </Grid>
                        </main>
                    </Router>
                </Provider>
            </div>
        </ThemeProvider>
    )
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
)(Root);