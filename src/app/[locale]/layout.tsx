// Providers
import ReduxProviders from "@/providers/StoreProvider";
import { SnackbarProvider } from "@/providers/SnackbarProvider"

// Next.js Analytics
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

// Workaround
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';

// components
import MainRoot from '@/components/Main/MainRoot';
import Menu from "@/components/Menu/Menu";
import Header from "@/components/Menu/Header";
import Box from '@mui/material-pigment-css/Box';

// Types
import type { Metadata } from 'next/types';

export const metadata: Metadata = {
  title: 'GamesPassionFR',
  description: 'Catalogue des jeux de GamesPassionFR',
}

type Props = {
  children: React.ReactNode,
  params: Promise<{
    locale: "en" | "fr"
  }>
}

import '@mui/material-pigment-css/styles.css';

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
  let resolvedLocale = (routing.locales.includes(locale)) ? locale : "fr";

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={resolvedLocale}>
      <body>
        <ReduxProviders>
          <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
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
          </NextIntlClientProvider>
        </ReduxProviders>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}