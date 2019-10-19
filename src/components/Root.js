import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

import Home from "./Home/Home";
import Player from "./PlaylistPlayer/Player";
import PlaylistsViewer from "./PlaylistsViewer/Viewer"

import {Container} from "@material-ui/core";
import basicStyle from "./Home/styles"

function Root({ store }) {

    const classes = basicStyle();

    return (
        <Provider store={store}>
            {/* https://github.com/facebook/create-react-app/issues/1765#issuecomment-327615099 */}
            <Router basename={process.env.PUBLIC_URL} >
                <Route
                    path="/"
                    render={(props) => <Home {...props} classes={classes} />}
                />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Container>
                        <Route path="/games" component={PlaylistsViewer} />
                        <Route path="/playlists/:playlistId" component={Player} />
                    </Container>
                </main>
            </Router>
        </Provider>
    )
}

export default Root