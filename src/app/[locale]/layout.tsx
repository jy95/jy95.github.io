// Providers
import { ThemeProvider } from "@/providers/ThemeProvider";
import StoreProvider from "@/providers/StoreProvider";

// Next.js Analytics
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

// Localization
import {routing} from '@/i18n/routing';
import {locale} from 'next/root-params';

// components
import Box from '@mui/material/Box';
import DashboardAppProvider from "@/components/dashboard/DashboardAppProvider";
import Footer from "@/components/Footer";

// Types
import type {Locale} from 'next-intl';
import type { Metadata } from 'next/types';
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: 'GamesPassionFR',
  description: 'Catalogue des jeux de GamesPassionFR',
}

type Props = {
  children: ReactNode,
  params: Promise<{
    locale: string
  }>
}


export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout(props: Props) {

  const {
    children
  } = props;

  // As we are in `[locale]/layout.tsx`, we can be sure that the locale is valid, 
  // but we still need to check it against the routing.locales array to avoid any issues with invalid locales.
  let curLocale = await locale();

  // To catch with stuff that aren't a locale
  const resolvedLocale : Locale = (routing.locales.includes(curLocale as Locale)) ? curLocale as Locale : "fr";

  return (
    <html lang={resolvedLocale}>
      <body>
        <StoreProvider>
          <ThemeProvider lng={resolvedLocale}>
            <DashboardAppProvider locale={resolvedLocale} >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100%'
                }}
              >
                {/* Main content */}
                <Box sx={{ flex: 1 }}>
                  {children}
                </Box>

                {/* Footer */}
                <Footer />
              </Box>
            </DashboardAppProvider>
          </ThemeProvider>
        </StoreProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
