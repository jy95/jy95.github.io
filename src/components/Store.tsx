import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

// @ts-ignore
import rootReducer from '../reducers/index.tsx'

/* eslint-disable no-underscore-dangle */
export default createStore(
    rootReducer,
    compose(
        applyMiddleware(thunk),
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ ? (window as any).__REDUX_DEVTOOLS_EXTENSION__() : f => f
    )
);
/* eslint-enable */