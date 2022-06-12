import React from 'react';
import { createRoot } from 'react-dom/client';

// Common
import './index.css';
// @ts-ignore
import * as serviceWorker from './serviceWorker.tsx';
// @ts-ignore
import store from "./components/Store.tsx"
// @ts-ignore
import Root from "./components/Root.tsx";

// For translation
import {I18nextProvider, initReactI18next} from "react-i18next";
import detector from "i18next-browser-languagedetector";
import i18next from "i18next";

import common_fr from "./translations/fr/common.json";
import common_en from "./translations/en/common.json";

// the translations
const resources = {
    fr: {
        common: common_fr // 'common' is our custom namespace
    },
    en: {
        common: common_en
    }
}

i18next
    .use(detector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        interpolation: { escapeValue: false },  // React already does escaping
        //lng: "fr", // the language to use by default // <--- turn off for detection to work
        fallbackLng: 'fr', // if detected lng is not available
        supportedLngs: ['fr', 'en'],
        resources
    });

const container = document.getElementById('root');
// createRoot(container!) if you use TypeScript 
// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis 
const root = createRoot(container!);
root.render(
    <I18nextProvider i18n={i18next}>
        <Root store={store} />
    </I18nextProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
