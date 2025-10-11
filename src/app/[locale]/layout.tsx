// Providers
import { ThemeProvider } from "@/providers/ThemeProvider";
import StoreProvider from "@/providers/StoreProvider";

// Next.js Analytics
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

// Workaround
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';

// components
import Box from '@mui/material/Box';
import DashboardAppProvider from "@/components/dashboard/DashboardAppProvider";

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
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  // To catch with stuff that aren't a locale
  const resolvedLocale : Locale = (routing.locales.includes(locale as Locale)) ? locale as Locale : "fr";

  // Enable static rendering
  setRequestLocale(resolvedLocale);

  return (
    <html lang={resolvedLocale}>
      <body>
        <StoreProvider>
          <ThemeProvider lng={resolvedLocale}>
            <DashboardAppProvider locale={resolvedLocale} >
              <Box
                sx={{
                  py: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {children}
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
