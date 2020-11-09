import React from 'react';
import { render } from 'react-dom'

// For translation
import {I18nextProvider} from "react-i18next";
import i18next from "i18next";

import common_fr from "./translations/fr/common.json";
import common_en from "./translations/en/common.json";

// Rest

import './index.css';
import * as serviceWorker from './serviceWorker';

import store from "./components/Store"
import Root from "./components/Root";

i18next.init({
    interpolation: { escapeValue: false },  // React already does escaping
    lng: 'fr',                              // language to use
    resources: {
        fr: {
            common: common_fr // 'common' is our custom namespace
        },
        en: {
            common: common_en
        }
    }
});

render(
    <I18nextProvider i18n={i18next}>
        <Root store={store} />
    </I18nextProvider>, 
    document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
