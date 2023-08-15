// Providers
import { NextIntlClientProvider } from 'next-intl';
import { Providers as ReduxProviders } from "@/redux/provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SnackbarProvider } from "@/providers/SnackbarProvider"

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
  return [{locale: 'fr'}, {locale: 'en'}];
}

export default async function RootLayout({children, params: {locale}} : Props) {

  // To catch with stuff that aren't a locale
  let resolvedLocale = (["en", "fr"].includes(locale)) ? locale : "fr";

  // Fetch messages in locale asked
  let messages = (await import(`../../../messages/${resolvedLocale}.json`)).default;

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
                  <Menu lang={resolvedLocale} />
                  <MainRoot>
                    {children}
                  </MainRoot>
                </Box>
              </SnackbarProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ReduxProviders>
      </body>
    </html>
  )
}