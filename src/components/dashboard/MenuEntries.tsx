// Icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScienceIcon from '@mui/icons-material/Science';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LinkIcon from '@mui/icons-material/Link';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import ExtensionIcon from '@mui/icons-material/Extension';
import CasinoIcon from '@mui/icons-material/Casino';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

// Types
import type { Navigation } from '@/components/toolpad/types';

/**
 * Builds the navigation tree using translation *keys* (`titleKey`) rather
 * than already-resolved strings. Previously this function took a flat
 * `Props` object of ~11 pre-translated labels computed once by the caller
 * (`AppProviderCustom`), which coupled the whole nav tree to a single
 * `useTranslations` call site, duplicated lookups for labels reused across
 * nodes (e.g. "games" appears under both `/games` and `/tier/games`), and
 * made this tree impossible to build/test without wiring up every label by
 * hand. `NavigationGroup` now resolves `titleKey` via `useTranslations` at
 * render time, so this function is a pure, translation-agnostic tree
 * definition.
 */
export default function NavigationMenu(): Navigation {
    return [
        {
            icon: <SportsEsportsIcon />,
            titleKey: "gamesKey",
            segment: "games",
            children: [
                {
                    icon: <GridViewIcon />,
                    titleKey: "gamesTabs.grid"
                },
                {
                    segment: "series",
                    icon: <ListIcon />,
                    titleKey: "gamesTabs.list"
                },
                {
                    segment: "dlcs",
                    icon: <ExtensionIcon />,
                    titleKey: "gamesTabs.dlc"
                },
                {
                    segment: "random",
                    icon: <CasinoIcon />,
                    titleKey: "gamesTabs.random"
                }
            ]
        },
        {
            icon: <ScheduleIcon />,
            titleKey: "planningKey",
            segment: "planning"
        },
        {
            icon: <HourglassEmptyIcon />,
            titleKey: "backlog",
            segment: "backlog"
        },
        {
            icon: <LeaderboardIcon />,
            titleKey: "tierTabs",
            segment: "tier",
            children: [
                {
                    segment: "games",
                    icon: <SportsEsportsIcon />,
                    titleKey: "gamesTabs.grid"
                },
                {
                    segment: "backlog",
                    icon: <HourglassEmptyIcon />,
                    titleKey: "backlog"
                },
                {
                    icon: <ScienceIcon />,
                    titleKey: "testsKey",
                    segment: "tests"
                }
            ]
        },
        {
            icon: <ScienceIcon />,
            titleKey: "testsKey",
            segment: "tests"
        },
        {
            icon: <QueryStatsIcon />,
            titleKey: "stats",
            segment: "stats"
        },
        {
            icon: <LinkIcon />,
            titleKey: "links",
            segment: "links"
        },
    ]
}