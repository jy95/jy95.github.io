"use client";

// Nextjs
import { useRouter } from 'next/navigation';

// Hooks
import useTranslation from 'next-translate/useTranslation'

// MUI components
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

// Icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ScheduleIcon from '@mui/icons-material/Schedule';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

// Entries for menu
type menuEntryTranslationKey = 'gamesKey' | 'planningKey' | 'stats';
type buttonEntry = {
    icon: JSX.Element,
    path: string,
    primary: `main.menuEntries.${menuEntryTranslationKey}`
}
const ENTRIES : buttonEntry[] = [
    {
        icon: <SportsEsportsIcon />,
        primary: "main.menuEntries.gamesKey",
        path: "/games"
    },
    {
        icon: <ScheduleIcon />,
        primary: "main.menuEntries.planningKey",
        path: "/planning"
    },
    {
        icon: <QueryStatsIcon />,
        primary: "main.menuEntries.stats",
        path: "/stats"
    }
]

function ButtonLink(props: buttonEntry) {

    // Hooks
    const router = useRouter();
    const { t } = useTranslation('common');

    // Props
    const { icon, primary, path } = props;

    return (
        <Button variant="contained" color="primary" startIcon={icon} onClick={() => router.push(path)}>
            { t(primary) }
        </Button>
    )
}

export default function WelcomeScreen() {

    const { t } = useTranslation('common');

    // TODO add illustration for welcome screen
    return (
        <div style={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
                { t("main.description") }
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
                {
                    ENTRIES.map(entry => <ButtonLink {...entry} key={entry.path}/>)
                }
            </Stack>
        </div>
    )
}