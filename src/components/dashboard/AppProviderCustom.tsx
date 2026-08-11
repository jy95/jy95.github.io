// Providers
import NextAppProvider from "@/components/toolpad/provider/AppProvider";

// components
import NavigationMenu from "./MenuEntries";
import { SilentSuspenseBoundary } from "@/components/common/SuspenseBoundary";

// Types
import type { ReactNode } from 'react';
type Props = {
    children: ReactNode
}

// Needed because of https://nextjs.org/docs/app/api-reference/functions/use-search-params#behavior
export default function AppProviderCustom(props: Props) {
    return (
        <SilentSuspenseBoundary>
            <NextAppProvider navigation={NavigationMenu()}>
                {props.children}
            </NextAppProvider>
        </SilentSuspenseBoundary>
    );
}