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
import CasinoIcon from '@mui/icons-material/Casino';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

// Types
import type { Navigation } from '@/components/toolpad/types';
type Props = {
    gamesCategoy: string,
    gamesView: string,
    seriesView: string,
    dlcsView: string,
    randomView: string,
    planned: string,
    backlog: string,
    tests: string,
    stats: string,
    links: string,
    tierListsCategory: string
}

export default function NavigationMenu(props: Props) : Navigation {
    return [
        {
            icon: <SportsEsportsIcon />,
            title: props.gamesCategoy,
            segment: "games",
            children: [
                {
                    icon: <AppsIcon />,
                    title: props.gamesView
                },
                {
                    segment: "series",
                    icon: <ListIcon />,
                    title: props.seriesView
                },
                {
                    segment: "dlcs",
                    icon: <ExtensionIcon />,
                    title: props.dlcsView
                },
                {
                    segment: "random",
                    icon: <CasinoIcon />,
                    title: props.randomView
                }
            ]
        },
        {
            icon: <ScheduleIcon />,
            title: props.planned,
            segment: "planning"
        },
        {
            icon: <HourglassEmptyIcon />,
            title: props.backlog,
            segment: "backlog"
        },
        {
            icon: <LeaderboardIcon />,
            title: props.tierListsCategory,
            segment: "tier",
            children: [
                {
                    segment: "games",
                    icon: <SportsEsportsIcon />,
                    title: props.gamesView
                },
            ]
        },
        {
            icon: <ScienceIcon />,
            title: props.tests,
            segment: "tests"
        },
        {
            icon: <QueryStatsIcon />,
            title: props.stats,
            segment: "stats"
        },
        {
            icon: <LinkIcon />,
            title: props.links,
            segment: "links"
        },
    ]
}