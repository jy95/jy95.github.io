// Providers
import { NextIntlClientProvider } from 'next-intl';
import { Providers as ReduxProviders } from "@/redux/provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SnackbarProvider } from "@/providers/SnackbarProvider"

// Not found
import {notFound} from 'next/navigation';

// components
import MainRoot from '@/components/Main/MainRoot';
import Menu from "@/components/Menu/Menu";
import Header from "@/components/Menu/Header";
import Box from "@/components/Main/Box";

// Types
import { Metadata } from 'next/types';

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

export default async  function RootLayout({children, params: {locale}} : Props) {

  // Fetch messages in locale asked
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <ReduxProviders>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider lng={locale}>
              <SnackbarProvider 
                maxSnack={3}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <Header />
                <Box sx={{ display: 'flex' }}>
                  <Menu lang={locale} />
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