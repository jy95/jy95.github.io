import Box from '@mui/material/Box';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ExtensionIcon from '@mui/icons-material/Extension';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useTranslations } from 'next-intl';
import type { SelectionCategory } from './documentTypes';

const icons = { games: SportsEsportsIcon, dlcs: ExtensionIcon, planning: ScheduleIcon, backlog: HourglassEmptyIcon };

export function SelectionKindBadge({ category }: { category: SelectionCategory }) {
    const t = useTranslations('selection');
    const Icon = icons[category];
    return <Box role="img" aria-label={t(`categories.${category}`)} sx={{
        alignSelf: 'flex-start', display: 'flex',
        p: 0.5, borderRadius: 1, bgcolor: 'background.paper', color: 'text.primary',
    }}><Icon fontSize="small" /></Box>;
}
