import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    redirects: async () => {
        return [
            {
                source: "/",
                destination: "/games",
                permanent: false
            }
        ]
    },
    images: {
        // https://nextjs.org/docs/app/api-reference/components/image#devicesizes
        // https://mui.com/material-ui/customization/breakpoints/
        deviceSizes: [600, 900, 1200]
    }
  }
   
  export default withNextIntl(nextConfig);