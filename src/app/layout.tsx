import type { Metadata } from 'next'
import { Providers as ReduxProviders } from "@/redux/provider";

import Menu from "@/components/Menu/Menu";
import Header from "@/components/Menu/Header";
import { DrawerHeader, Main } from '@/components/Menu/Drawer';

import { useAppSelector } from "@/redux/hooks";

// Selectors
import { selectOpenMenu } from '@/redux/services/miscellaneousSlice';

// MUI component
import Box from '@mui/material/Box';

export const metadata: Metadata = {
  title: 'GamesPassionFR',
  description: 'Catalogue des jeux de GamesPassionFR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const openMenu = useAppSelector((state) => selectOpenMenu(state));

  return (
    <html lang="en">
      <body>
        <ReduxProviders>
          <Box sx={{ display: 'flex' }}>
            <Header />
            <Menu />
            {/* @ts-ignore Mui has some issue sending attr to children*/}
            <Main open={ openMenu } >
              <DrawerHeader />
              {children}
            </Main>
          </Box>
        </ReduxProviders>
      </body>
    </html>
  )
}
