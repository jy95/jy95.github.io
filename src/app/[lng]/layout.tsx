"use client";

// i18n
import { dir } from 'i18next'
import { languages } from '@/i18n/settings'

//import type { Metadata } from 'next'
// Providers
import { Providers as ReduxProviders } from "@/redux/provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SnackbarProvider } from 'notistack';

// MUI
import Menu from "@/components/Menu/Menu";
import Header from "@/components/Menu/Header";
import { DrawerHeader, Main } from '@/components/Menu/Drawer';

import { useAppSelector } from "@/redux/hooks";

// Selectors
import { selectOpenMenu } from '@/redux/services/miscellaneousSlice';

// MUI component
import Box from '@mui/material/Box';

// Hooks
import { useLocale } from "@/hooks/useLocale";

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

/*
export const metadata: Metadata = {
  title: 'GamesPassionFR',
  description: 'Catalogue des jeux de GamesPassionFR',
}
*/

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const language = useLocale();

  return (
    <html lang={language} dir={dir(language)}>
      <body>
        <ReduxProviders>
          <ThemeProvider lng={language}>
            <SnackbarProvider 
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <Header />
                <Menu />
                <MainRoot children={children}/>
              </Box>
            </SnackbarProvider>
          </ThemeProvider>
        </ReduxProviders>
      </body>
    </html>
  )
}

function MainRoot({
  children,
}: {
  children: React.ReactNode
}){

  const openMenu = useAppSelector((state) => selectOpenMenu(state));

  return (
    /* @ts-ignore Mui has some issue sending attr to children*/
    <Main open={ openMenu } >
      <DrawerHeader />
      {children}
    </Main>
  )
}