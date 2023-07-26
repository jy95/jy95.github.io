/** @type {import('next').NextConfig} */
const nextConfig = {
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
