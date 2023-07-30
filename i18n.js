module.exports = {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    pages: {
        "*": ["common"]
    },
    // However, you can use another destination to save your namespaces files using loadLocaleFrom configuration property:
    // https://www.npmjs.com/package/next-translate#3-configuration
    "loadLocaleFrom": (lang, ns) => import(`./locales/${lang}/${ns}.json`).then((m) => m.default),
}