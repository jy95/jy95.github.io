/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects: async() => {
        return [
            {
                source: "/games",
                destination: "/",
                permanent: false
            }
        ]
    }
}

module.exports = nextConfig;
