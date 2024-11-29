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
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Box from '@mui/material/Box';
import DashboardAppProvider from "@/components/dashboard/DashboardAppProvider";
import ToolbarActions from "@/components/dashboard/ToolbarActions";

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
            <ThemeProvider lng={resolvedLocale}>
              <SnackbarProvider 
                maxSnack={3}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <DashboardAppProvider>
                  <DashboardLayout 
                    defaultSidebarCollapsed 
                    slots={{
                      toolbarActions: ToolbarActions
                    }}
                  >
                    <Box
                      sx={{
                        py: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {children}
                    </Box>
                  </DashboardLayout>
                </DashboardAppProvider>
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