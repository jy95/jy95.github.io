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
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import BusinessIcon from '@mui/icons-material/Business';

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import PersonalSelectionBadge from './PersonalSelectionBadge';

// Types
import type { Navigation } from '@/components/toolpad/types';

export default function NavigationMenu(): Navigation {
    return [
        { kind: "section", titleKey: "sections.browse" },
        { segment: "games", icon: <SportsEsportsIcon />, titleKey: "gamesKey" },
        { path: "/games/series", icon: <ListIcon />, titleKey: "gamesTabs.list" },
        { path: "/games/dlcs", icon: <ExtensionIcon />, titleKey: "gamesTabs.dlc" },
        { segment: "companies", icon: <BusinessIcon />, titleKey: "gamesTabs.companies" },
        { kind: "section", titleKey: "sections.opinions" },
        { segment: "tests", icon: <ScienceIcon />, titleKey: "testsKey" },
        {
            segment: "tier", icon: <LeaderboardIcon />, titleKey: "tierTabs",
            children: [
                { segment: "games", icon: <GridViewIcon />, titleKey: "tierChildren.games" },
                { segment: "backlog", icon: <HourglassEmptyIcon />, titleKey: "tierChildren.backlog" },
                { segment: "tests", icon: <ScienceIcon />, titleKey: "tierChildren.tests" },
            ],
        },
        { kind: "section", titleKey: "sections.comingUp" },
        { segment: "planning", icon: <ScheduleIcon />, titleKey: "planningKey" },
        { segment: "backlog", icon: <HourglassEmptyIcon />, titleKey: "backlog", hintKey: "backlogHint" },
        { kind: "section", titleKey: "sections.mine" },
        { segment: "selection", icon: <BookmarkBorderIcon />, titleKey: "selection", badge: PersonalSelectionBadge },
        { kind: "section", titleKey: "sections.more" },
        { segment: "stats", icon: <QueryStatsIcon />, titleKey: "stats" },
        { segment: "links", icon: <LinkIcon />, titleKey: "links" },
    ];
}
