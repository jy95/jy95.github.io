import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'

// For translation
import {I18nextProvider, initReactI18next} from "react-i18next";
import detector from "i18next-browser-languagedetector";
import resourcesToBackend from 'i18next-resources-to-backend';
import i18next from "i18next";

// Common
// @ts-ignore
//import * as serviceWorker from './serviceWorker.tsx';
// @ts-ignore
import store from "./components/Store.tsx"
// @ts-ignore
import Root from "./components/Root.tsx";

i18next
    // Lazy translations : most of the time, user will choose only one language
    .use(resourcesToBackend((language, namespace, callback) => {
        import(`./translations/${language}/${namespace}.json`)
            .then((resources) => {
                callback(null, resources)
            })
            .catch((error) => {
                callback(error, null)
            })
    }))
    .use(detector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        interpolation: { escapeValue: false },  // React already does escaping
        //lng: "fr", // the language to use by default // <--- turn off for detection to work
        fallbackLng: 'fr', // if detected lng is not available
        supportedLngs: ['fr', 'en'],
        ns: ['common'],
        defaultNS: 'common'
    });

const container = document.getElementById('root');
// createRoot(container!) if you use TypeScript 
// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis 
const root = createRoot(container!);
root.render(
    <I18nextProvider i18n={i18next}>
        <Provider store={store}>
            <Root />
        </Provider>
    </I18nextProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
