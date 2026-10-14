import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // The social renderer reads local artwork and the font bundled with Next.js.
    // Include these files explicitly in serverless deployments with dynamic file paths.
    outputFileTracingIncludes: {
        '/api/social': [
            './node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf',
            './public/{covers,backlogcovers,testscovers,companies,seriescovers}/**/*',
        ],
    },
    images: {
        // https://nextjs.org/docs/app/api-reference/components/image#devicesizes
        // https://mui.com/material-ui/customization/breakpoints/
        deviceSizes: [600, 900, 1200]
    }
  }
   
  export default withNextIntl(nextConfig);
