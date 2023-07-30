"use client";

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
import useTranslation from 'next-translate/useTranslation'

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

  const { lang } = useTranslation("common");

  return (
    <html lang={lang}>
      <body>
        <ReduxProviders>
          <ThemeProvider lng={lang}>
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