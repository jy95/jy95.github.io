'use client';

import { memo, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AppsIcon from '@mui/icons-material/Apps';
import { Link } from '@/i18n/routing';
import GamesFilters from '@/app/[locale]/games/_client/GamesFilters';
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import ResponsiveSelect from '@/components/common/ResponsiveSelect';
import BaseCard from '@/features/games/components/BaseCard';
import CardEntry from '@/features/games/components/CardEntry';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import { useGamesFilters } from '@/features/games/useGamesFilters';
import { usePagedSlice } from '@/hooks/usePagedSlice';
import { browseGames } from '@/lib/browseGames';
import SelectionButton from './SelectionButton';
import { SelectionKindBadge, SelectionKindIcon } from './SelectionKindBadge';
import { SELECTION_CATEGORIES, isSelectionKind, type SelectionKind } from './selectionDocument';
import type { SelectionEntry } from './catalogue';

const PAGE_SIZE = 12;

function KindFilter({ kind, setKind }: { kind: SelectionKind; setKind: (kind: SelectionKind) => void }) {
    const t = useTranslations('selection');
    const options = [
        { value: 'all', label: t('categories.all'), icon: <AppsIcon fontSize="small" aria-hidden="true" /> },
        ...SELECTION_CATEGORIES.map(category => ({
            value: category, label: t(`categories.${category}`), icon: <SelectionKindIcon category={category} />,
        })),
    ];
    return <ResponsiveSelect label={t('kinds')} value={kind} options={options}
        onChange={value => { if (isSelectionKind(value)) setKind(value); }} />;
}

function SelectionCard({ entry, onDetail }: { entry: SelectionEntry; onDetail: (entry: SelectionEntry) => void }) {
    const badge = <SelectionKindBadge category={entry.category} />;
    if (entry.source === 'published') {
        return <CardEntry category={entry.category} game={entry.game} badge={badge} />;
    }
    return <BaseCard item={entry.game} badgesSlot={() => badge} onClick={() => onDetail(entry)} overlayPersistent
        overlaySlot={game => <GameCardOverlay game={game} />}
        actionsSlot={game => <SelectionButton id={game.id} category={entry.category} title={game.title} />} />;
}

const Cards = memo(function Cards({ entries, onDetail }: { entries: SelectionEntry[]; onDetail: (entry: SelectionEntry) => void }) {
    return (
        <Grid container spacing={1} rowSpacing={1}>
            {entries.map(entry => (
                <Grid key={`${entry.category}:${entry.selectionId}`} size={{ xs: 6, md: 4, lg: 2 }}>
                    <SelectionCard entry={entry} onDetail={onDetail} />
                </Grid>
            ))}
        </Grid>
    );
});

function EmptyState({ shared }: { shared: boolean }) {
    const t = useTranslations('selection');
    return (
        <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>{t(shared ? 'sharedEmpty' : 'empty')}</Typography>
            <Button component={Link} href="/games" variant="outlined">{t('browse')}</Button>
        </Box>
    );
}

type Props = { entries: SelectionEntry[]; shared: boolean; onDetail: (entry: SelectionEntry) => void };

/** Pure presentation: kind, catalogue filters, sort and paging never touch the stored selection. */
export function SelectionGrid({ entries, shared, onDetail }: Props) {
    const common = useTranslations('common');
    const { filters, updateFilters } = useGamesFilters();
    const [kind, setKind] = useState<SelectionKind>('all');
    const browsable = useMemo(() => entries.map(entry => ({ ...entry.game, entry })), [entries]);
    const shown = useMemo(() => {
        const scoped = kind === 'all' ? browsable : browsable.filter(item => item.entry.category === kind);
        return browseGames(scoped, filters).map(item => item.entry);
    }, [browsable, kind, filters]);
    const { visible, hasMore, loadMore } = usePagedSlice(shown, PAGE_SIZE);

    if (entries.length === 0) return <EmptyState shared={shared} />;
    return <>
        <GamesFilters filters={filters} onChange={updateFilters} />
        <KindFilter kind={kind} setKind={setKind} />
        {visible.length > 0
            ? <Cards entries={visible} onDetail={onDetail} />
            : <Typography role="status">{common('noResults')}</Typography>}
        <Grid container sx={{ justifyContent: 'center' }}>
            <LoadingButton disabled={!hasMore} onClick={loadMore} label={common('loadMore')} />
        </Grid>
    </>;
}