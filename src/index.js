import React from 'react';

import { render } from 'react-dom'
import { createStore } from 'redux'
import reducers  from './reducers/reducers'
import Root from './routes'
import './index.css';
import * as serviceWorker from './serviceWorker';

const store = createStore(reducers)
render(<Root store={store} />, document.getElementById('root'))


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
