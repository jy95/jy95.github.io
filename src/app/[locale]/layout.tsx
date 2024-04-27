// Providers
import { NextIntlClientProvider } from 'next-intl';
import { Providers as ReduxProviders } from "@/redux/provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SnackbarProvider } from "@/providers/SnackbarProvider"

// Next.js Analytics
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

// Workaround
import {unstable_setRequestLocale} from 'next-intl/server';

// components
import MainRoot from '@/components/Main/MainRoot';
import Menu from "@/components/Menu/Menu";
import Header from "@/components/Menu/Header";
import Box from "@/components/Main/Box";

import { locales } from '@/navigation';

// Types
import type { Metadata } from 'next/types';

export const metadata: Metadata = {
  title: 'GamesPassionFR',
  description: 'Catalogue des jeux de GamesPassionFR',
}

type Props = {
  children: React.ReactNode,
  params: {
    locale: "en" | "fr"
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function RootLayout({children, params: {locale}} : Props) {

  // To catch with stuff that aren't a locale
  let resolvedLocale = (locales.includes(locale)) ? locale : "fr";

  // Fetch messages in locale asked
  let messages = (await import(`../../../messages/${resolvedLocale}.json`)).default;

  unstable_setRequestLocale(resolvedLocale);

  return (
    <html lang={resolvedLocale}>
      <body>
        <ReduxProviders>
          <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
            <ThemeProvider lng={resolvedLocale}>
              <SnackbarProvider 
                maxSnack={3}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <Header />
                <Box sx={{ display: 'flex' }}>
                  <Menu />
                  <MainRoot>
                    {children}
                  </MainRoot>
                </Box>
              </SnackbarProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ReduxProviders>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}