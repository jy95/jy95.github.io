import Box from '@mui/material/Box';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ExtensionIcon from '@mui/icons-material/Extension';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useTranslations } from 'next-intl';
import type { SvgIconComponent } from '@mui/icons-material';
import type { SelectionCategory } from './selectionDocument';
const icons: Record<SelectionCategory, SvgIconComponent> = {
    games: SportsEsportsIcon, 
    dlcs: ExtensionIcon, 
    planning: ScheduleIcon, 
    backlog: HourglassEmptyIcon,
};

export function SelectionKindIcon({ category }: { category: SelectionCategory }) {
    const Icon = icons[category];
    return <Icon fontSize="small" aria-hidden="true" />;
}

export function SelectionKindBadge({ category }: { category: SelectionCategory }) {
    const t = useTranslations('selection');
    return <Box role="img" aria-label={t(`categories.${category}`)} sx={{
        alignSelf: 'flex-start', display: 'flex',
        p: 0.5, borderRadius: 1, bgcolor: 'background.paper', color: 'text.primary',
    }}><SelectionKindIcon category={category} /></Box>;
}
