import { DrawerHeader, Main } from '@/components/Menu/Drawer';

import { useAppSelector } from "@/redux/hooks";

// Selectors
import { selectOpenMenu } from '@/redux/features/miscellaneousSlice';

export default function MainRoot({
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