const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n,
    redirects: async() => {
        return [
            {
                source: "/",
                destination: "/stats",
                permanent: true
            }
        ]
    }
}

module.exports = nextConfig;
