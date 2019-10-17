import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

import Home from "./components/Home/Home";
import Demo from "./components/Demo"
import Player from "./components/PlaylistPlayer/Player";
import {Container} from "@material-ui/core";
import basicStyle from "./components/Home/styles"

function Root({ store }) {

    const classes = basicStyle();

    return (
        <Provider store={store}>
            <Router>
                <Route
                    path="/"
                    render={(props) => <Home {...props} classes={classes} />}
                />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Container>
                        <Route path="/demo" component={Demo} />
                        <Route path="/playlists/:playlistId" component={Player} />
                    </Container>
                </main>
            </Router>
        </Provider>
    )
}

export default Root