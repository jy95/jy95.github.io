'use client';

import { useId, type ReactNode } from 'react';
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

type Group<T> = { id?: string | number; name: string; items: T[] };
type Props<T extends Group<unknown>> = { itemSize: GridSize; defaultExpanded?: boolean } & (
    | { groups: Group<CardGame>[]; renderContent?: never }
    | { groups: T[]; renderContent: (group: T) => ReactNode }
);

export function GroupedGamesAccordion<T extends Group<unknown>>({ itemSize, defaultExpanded = false, ...props }: Props<T>) {
    const instanceId = useId();
    const groups = props.renderContent
        ? props.groups.map(group => ({ ...group, content: props.renderContent(group) }))
        : props.groups.map(group => ({ ...group, content: <CardGrid items={group.items} size={itemSize} /> }));
    return (<>
        {groups.map((group) => {
            const groupId = encodeURIComponent(String(group.id ?? group.name));
            const panelId = `${instanceId}-${groupId}`;
            return (
                <Accordion key={group.id ?? group.name} defaultExpanded={defaultExpanded}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${panelId}-content`} id={`${panelId}-header`}>
                        <Typography component="h2">{group.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {group.content}
                    </AccordionDetails>
                </Accordion>
            );
        })}
    </>);
}
