// Providers
import {NextIntlClientProvider} from 'next-intl';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// Hooks
import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';

// components
import { DashboardLayout } from '@/components/toolpad';
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

    const toolbarActionsProps = {
        settingsLabel: t("settings"),
        darkLabel: t("modes.dark"),
        englishLabel: t("languages.en"),
        frenchLabel: t("languages.fr"),
        languageTitle: t("languages.title"),
        lightLabel: t("modes.light"),
        modeTitle: t("modes.title"),
        systemLabel: t("modes.system")
    }

    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProviderCustom>
                <NextIntlClientProvider>
                    <DashboardLayout 
                        defaultSidebarCollapsed 
                        slots={{
                            toolbarActions: ToolbarActions
                        }}
                        slotProps={{
                            toolbarActions: toolbarActionsProps
                        }}
                    >
                        {children}
                    </DashboardLayout>
                </NextIntlClientProvider>
            </AppProviderCustom>
        </AppRouterCacheProvider>
    );
}