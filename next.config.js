const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Github pages is a static host
    output: "export"
}

// Or if you already have next.config.js file and want to keep the changes in it, pass the config object to the nextTranslate()
module.exports = nextTranslate(nextConfig);
