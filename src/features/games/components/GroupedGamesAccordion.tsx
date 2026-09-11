// MUI
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

// Others
import { CardGrid } from './CardGrid';

// Types
import type { CardGame } from '@/domain/games/types';
import type { GridSize } from './CardGrid';

type Group = { name: string; items: CardGame[] };

export function GroupedGamesAccordion({ groups, itemSize }: { groups: Group[]; itemSize: GridSize }) {
    return (<>
        {groups.map((g) => (
            <Accordion key={g.name}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-content${g.name}`} id={`panel-header${g.name}`}>
                    <Typography>{g.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <CardGrid items={g.items} size={itemSize} />
                </AccordionDetails>
            </Accordion>
        ))}
    </>)
};