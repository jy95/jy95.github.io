/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects: async () => {
        return [
            {
                source: "/",
                destination: "/games",
                permanent: false
            }
        ]
    }
}

module.exports = nextConfig;
