// Icons
import CasinoIcon from '@mui/icons-material/Casino';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
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
        { kind: "group", id: "browse", titleKey: "sections.browse", icon: <SportsEsportsIcon />, children: [
            { path: "/games", icon: <SportsEsportsIcon />, titleKey: "gamesKey", hintKey: "hints.games" },
            { path: "/games/series", icon: <ListIcon />, titleKey: "gamesTabs.list", hintKey: "hints.series" },
            { path: "/games/dlcs", icon: <ExtensionIcon />, titleKey: "gamesTabs.dlc", hintKey: "hints.dlc" },
            { path: "/companies", icon: <BusinessIcon />, titleKey: "gamesTabs.companies", hintKey: "hints.companies" },
            { path: "/games/random", icon: <CasinoIcon />, titleKey: "gamesTabs.random", hintKey: "hints.random" },
            { path: "/tests", icon: <ScienceIcon />, titleKey: "testsKey", hintKey: "hints.tests" },
        ] },
        { kind: "group", id: "coming-up", titleKey: "sections.comingUp", icon: <ScheduleIcon />, children: [
            { path: "/planning", icon: <ScheduleIcon />, titleKey: "planningKey", hintKey: "hints.planning" },
            { path: "/backlog", icon: <HourglassEmptyIcon />, titleKey: "backlog", hintKey: "hints.backlog" },
        ] },
        { kind: "group", id: "saved", titleKey: "sections.saved", icon: <BookmarkBorderIcon />, children: [
            { path: "/selection", icon: <BookmarkBorderIcon />, titleKey: "selection", hintKey: "hints.selection", badge: PersonalSelectionBadge },
        ] },
        { kind: "group", id: "opinions", titleKey: "tierTabs", icon: <LeaderboardIcon />, children: [
            { path: "/tier/games", icon: <GridViewIcon />, titleKey: "tierChildren.games", hintKey: "hints.tierGames" },
            { path: "/tier/backlog", icon: <HourglassEmptyIcon />, titleKey: "tierChildren.backlog", hintKey: "hints.tierBacklog" },
            { path: "/tier/tests", icon: <ScienceIcon />, titleKey: "tierChildren.tests", hintKey: "hints.tierTests" },
        ] },
        { kind: "group", id: "more", titleKey: "sections.more", icon: <MoreHorizIcon />, children: [
            { path: "/stats", icon: <QueryStatsIcon />, titleKey: "stats", hintKey: "hints.stats" },
            { path: "/links", icon: <LinkIcon />, titleKey: "links", hintKey: "hints.links" },
        ] },
    ];
}
