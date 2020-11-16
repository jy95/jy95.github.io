import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

// Dark mode
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import Header from "./Home/Header";
import Menu from "./Home/Menu"
import Player from "./YTPlayer/Player";
import GamesGallery from "./GamesView/GamesGallery";
import Planning from "./Planning/Planning";

import Grid from '@material-ui/core/Grid';
import basicStyle from "./Home/styles"

function Root({ store }) {

    const classes = basicStyle();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // for drawer
    const [open, setOpen] = React.useState(false);
    // for dark mode
    const [dark, setDark] = React.useState(prefersDarkMode);

    // Prepare theme for possible darkmode
    const theme = React.useMemo(
        () =>
          createMuiTheme({
            palette: {
              type: dark ? 'dark' : 'light',
            },
          }),
        [dark],
      );

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <Provider store={store}>
                    {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                    <Router basename={process.env.PUBLIC_URL} >
                        <Header drawerOpen={open} drawerSetOpen={setOpen} darkMode={dark} setDarkMode={setDark} classes={classes}/>
                        <Menu open={open} setOpen={setOpen} classes={classes}/>
                        <main className={classes.content}>
                            <div className={classes.toolbar} />
                            <Grid container>
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

export default Root