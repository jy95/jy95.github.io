import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

import Header from "./Home/Header";
import Menu from "./Home/Menu"
import Player from "./YTPlayer/Player";
import GamesGallery from "./GamesView/GamesGallery";
import Planning from "./Planning/Planning";

import Grid from '@material-ui/core/Grid';
import basicStyle from "./Home/styles"

function Root({ store }) {

    const classes = basicStyle();

    // for drawser
    const [open, setOpen] = React.useState(false);

    return (
        <div className={classes.root}>
            <Provider store={store}>
                {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                <Router basename={process.env.PUBLIC_URL} >
                    <Header open={open} setOpen={setOpen} classes={classes}/>
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
    )
}

export default Root