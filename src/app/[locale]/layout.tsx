// Providers
import { Providers as ReduxProviders } from "@/redux/provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
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
import Box from "@/components/Main/Box";

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
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({children, params: {locale}} : Props) {

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