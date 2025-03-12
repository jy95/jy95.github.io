// Providers
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// Hooks
import {useCallback, useMemo} from 'react';
import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';

// components
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import AppProviderCustom from "@/components/dashboard/AppProviderCustom";
import ToolbarActions from "@/components/dashboard/ToolbarActions";

// Types
import type {Locale} from 'next-intl';
import type { ReactNode } from "react";

type Props = {
    children: ReactNode,
    locale: Locale
}

export default function DashboardAppProvider({children, locale} : Props) {

    // Enable static rendering
    setRequestLocale(locale);

    // Fetch labels
    const t = useTranslations('dashboard.toolbar');

    const toolbarActionsProps = useMemo(() => ({
        settingsLabel: t("settings"),
        darkLabel: t("modes.dark"),
        englishLabel: t("languages.en"),
        frenchLabel: t("languages.fr"),
        languageTitle: t("languages.title"),
        lightLabel: t("modes.light"),
        modeTitle: t("modes.title"),
        systemLabel: t("modes.system")
    }), [t]);

    // https://github.com/mui/toolpad/issues/4512
    const ToolbarComponent = useCallback(
        () => <ToolbarActions {...toolbarActionsProps} />, 
        [toolbarActionsProps]
    );

    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProviderCustom>
                <DashboardLayout 
                    defaultSidebarCollapsed 
                    slots={{
                        toolbarActions: ToolbarComponent
                    }}
                >
                    {children}
                </DashboardLayout>
            </AppProviderCustom>
        </AppRouterCacheProvider>
    );
}