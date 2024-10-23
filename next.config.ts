import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
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
   
  export default withNextIntl(nextConfig);