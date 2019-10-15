import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'

import HomePage from "./components/HomePage/HomePage";

const Root = ({ store }) => (
    <Provider store={store}>
        <Router>
            <Route path="/" component={HomePage} />
        </Router>
    </Provider>
)

export default Root

