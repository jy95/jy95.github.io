import createNextIntlPlugin from 'next-intl/plugin';
import { withPigment } from '@pigment-css/nextjs-plugin';

// Types
import type { NextConfig } from 'next'
import type { PigmentOptions } from "@pigment-css/nextjs-plugin"

// Rest
import { createTheme } from '@mui/material';

// Set up
const withNextIntl = createNextIntlPlugin();
const pigmentConfig: PigmentOptions = {
    transformLibraries: ['@mui/material'],
    theme: createTheme({
        cssVariables: true,
        colorSchemes: { dark: true },
    })
};

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
   
  export default withPigment(withNextIntl(nextConfig), pigmentConfig);