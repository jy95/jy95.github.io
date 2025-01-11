// Providers
import { NextAppProvider } from '@toolpad/core/nextjs';

// Hooks
import {useTranslations} from 'next-intl';

// components
import { Suspense } from 'react';
import NavigationMenu from "./MenuEntries";

// Types
import type { ReactNode } from 'react';
type Props = {
    children: ReactNode
}

// Needed because of https://nextjs.org/docs/app/api-reference/functions/use-search-params#behavior
export default function AppProviderCustom(props: Props) {
    return (
        <Suspense fallback={<></>}>
            <AppProviderCustomInner {...props} />
        </Suspense>
    )
}

function AppProviderCustomInner(props: Props) {

    // Fetch labels
    const t = useTranslations('dashboard');

    // Generate navigation
    const NAVIGATION = NavigationMenu({
        backlog: t("menuEntries.backlog"),
        dlcsView: t("menuEntries.gamesTabs.dlc"),
        gamesCategoy: t("menuEntries.gamesKey"),
        gamesView: t("menuEntries.gamesTabs.grid"),
        links: t("menuEntries.links"),
        planned: t("menuEntries.planningKey"),
        seriesView: t("menuEntries.gamesTabs.list"),
        stats: t("menuEntries.stats"),
        tests: t("menuEntries.testsKey")
    });

    return (
        <NextAppProvider 
            navigation={NAVIGATION}
            branding={{
                title: "GamesPassionFR",
                logo: <>&nbsp;</>
            }}
        >
            {props.children}
        </NextAppProvider>
    );
}