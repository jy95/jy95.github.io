// Providers
import { AppProvider } from '@toolpad/core/nextjs';

// Hooks
import {useTranslations} from 'next-intl';

// icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScienceIcon from '@mui/icons-material/Science';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LinkIcon from '@mui/icons-material/Link';

// Types
import type { Navigation } from '@toolpad/core/AppProvider';

export default async function DashboardAppProvider({
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
            segment: "/games"
        },
        {
            icon: <ScheduleIcon />,
            title: t("planningKey"),
            segment: "/planning"
        },
        {
            icon: <HourglassEmptyIcon />,
            title: t("backlog"),
            segment: "/backlog"
        },
        {
            icon: <ScienceIcon />,
            title: t("testsKey"),
            segment: "/tests"
        },
        {
            icon: <QueryStatsIcon />,
            title: t("stats"),
            segment: "/stats"
        },
        {
            icon: <LinkIcon />,
            title: t("links"),
            segment: "/links"
        },
    ];

    return (
        <AppProvider 
            navigation={NAVIGATION}
            branding={{
                title: "GamesPassionFR"
            }}
        >
            {children}
        </AppProvider>
    )
}