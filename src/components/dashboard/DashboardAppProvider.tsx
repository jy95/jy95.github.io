// Providers
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// Hooks
import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';

// components
import { Suspense } from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import ToolbarActions from "@/components/dashboard/ToolbarActions";

type Props = {
    children: ReactNode,
    locale: "en" | "fr"
}

import NavigationMenu from "./MenuEntries";

// Types
import type { ReactNode } from "react";

export default function DashboardAppProvider({children, locale} : Props) {

    // Enable static rendering
    setRequestLocale(locale);

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
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <Suspense fallback={<></>}>
                <AppProvider 
                    navigation={NAVIGATION}
                    branding={{
                        title: "GamesPassionFR",
                        logo: <>&nbsp;</>
                    }}
                >
                <DashboardLayout 
                    defaultSidebarCollapsed 
                    slots={{
                        // @ts-ignore Type not accurate, will report it to MUI later
                        toolbarActions: ToolbarActions
                    }}
                    slotProps={{
                        toolbarActions: {
                            settingsLabel: t("toolbar.settings"),
                            darkLabel: t("toolbar.modes.dark"),
                            englishLabel: t("toolbar.languages.en"),
                            frenchLabel: t("toolbar.languages.fr"),
                            languageTitle: t("toolbar.languages.title"),
                            lightLabel: t("toolbar.modes.light"),
                            modeTitle: t("toolbar.modes.title"),
                            systemLabel: t("toolbar.modes.system")
                        }
                    }}
                >
                    {children}
                </DashboardLayout>
                </AppProvider>
            </Suspense>
        </AppRouterCacheProvider>
    );
}