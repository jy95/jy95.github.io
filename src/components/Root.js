import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

import Home from "./Home/Home";
import Player from "./YTPlayer/Player";
import GamesGallery from "./GamesView/GamesGallery";
import Planning from "./Planning/Planning";

import {Container} from "@material-ui/core";
import basicStyle from "./Home/styles"

function Root({ store }) {

    const classes = basicStyle();

    return (
        <div className={classes.root}>
            <Provider store={store}>
                {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
                <Router basename={process.env.PUBLIC_URL} >
                    <Home classes={classes} />
                    <main className={classes.content}>
                        <div className={classes.toolbar} />
                        <Container>
                            <Route path="/games" component={GamesGallery} />
                            <Route path="/playlist/:id" component={Player} />
                            <Route path="/video/:id" component={Player} />
                            <Route path="/planning" component={Planning} />
                        </Container>
                    </main>
                </Router>
            </Provider>
        </div>
    )
}

export default Root