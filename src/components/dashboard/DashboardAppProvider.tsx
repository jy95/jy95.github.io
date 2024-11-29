// Providers
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// Hooks
import {useTranslations} from 'next-intl';

// Icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScienceIcon from '@mui/icons-material/Science';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LinkIcon from '@mui/icons-material/Link';
import AppsIcon from '@mui/icons-material/Apps';
import ListIcon from '@mui/icons-material/List';
import ExtensionIcon from '@mui/icons-material/Extension';

// Types
import type { Navigation } from '@toolpad/core/AppProvider';

export default function DashboardAppProvider({
    children,
  }: {
    children: React.ReactNode
  }) {

    // Fetch labels
    const t = useTranslations('header.menuEntries');

    // Generate navigation
    const NAVIGATION: Navigation = [
        {
            icon: <SportsEsportsIcon />,
            title: t("gamesKey"),
            segment: "games",
            children: [
                {
                    icon: <AppsIcon />,
                    title: t("gamesTabs.grid")
                },
                {
                    segment: "series",
                    icon: <ListIcon />,
                    title: t("gamesTabs.list")
                },
                {
                    segment: "dlcs",
                    icon: <ExtensionIcon />,
                    title: t("gamesTabs.dlc")
                }
            ]
        },
        {
            icon: <ScheduleIcon />,
            title: t("planningKey"),
            segment: "planning"
        },
        {
            icon: <HourglassEmptyIcon />,
            title: t("backlog"),
            segment: "backlog"
        },
        {
            icon: <ScienceIcon />,
            title: t("testsKey"),
            segment: "tests"
        },
        {
            icon: <QueryStatsIcon />,
            title: t("stats"),
            segment: "stats"
        },
        {
            icon: <LinkIcon />,
            title: t("links"),
            segment: "links"
        },
    ];

    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProvider 
                navigation={NAVIGATION}
                branding={{
                    title: "GamesPassionFR",
                    logo: <></>
                }}
            >
                {children}
            </AppProvider>
        </AppRouterCacheProvider>
    );
}