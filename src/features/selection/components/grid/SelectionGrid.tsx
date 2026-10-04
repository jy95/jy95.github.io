'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';

import { useGamesFilters } from '@/features/games/useGamesFilters';
import { usePagedSlice } from '@/hooks/usePagedSlice';
import { browseGames } from '@/lib/browseGames';

import { SelectionCards } from './SelectionCards';
import { SelectionEmptyState } from './SelectionEmptyState';
import { SelectionFilters } from './SelectionFilters';

// Types
import type { SelectionKind, SelectionEntry } from "@/domain/selection/types";

const PAGE_SIZE = 12;

type SelectionGridProps = {
  entries: SelectionEntry[];
  shared: boolean;
  onDetail: (entry: SelectionEntry) => void;
};

/** Pure presentation: kind, catalogue filters, sort and paging never touch the stored selection. */
export function SelectionGrid({ entries, shared, onDetail }: SelectionGridProps) {
  const common = useTranslations('common');
  const { filters, updateFilters } = useGamesFilters();
  const [kind, setKind] = useState<SelectionKind>('all');

  const browsable = useMemo(
    () => entries.map(entry => ({ ...entry.game, entry })),
    [entries]
  );

  const shown = useMemo(() => {
    const scoped = kind === 'all' ? browsable : browsable.filter(item => item.entry.category === kind);
    return browseGames(scoped, filters).map(item => item.entry);
  }, [browsable, kind, filters]);

  const { visible, hasMore, loadMore } = usePagedSlice(shown, PAGE_SIZE);

  if (entries.length === 0) {
    return <SelectionEmptyState shared={shared} />;
  }

  return (
    <>
      <SelectionFilters
        kind={kind}
        onKindChange={setKind}
        filters={filters}
        onFiltersChange={updateFilters}
      />
      {visible.length > 0 ? (
        <SelectionCards selectable={!shared} entries={visible} onDetail={onDetail} />
      ) : (
        <Typography role="status">{common('noResults')}</Typography>
      )}
      <Grid container sx={{ justifyContent: 'center' }}>
        <LoadingButton disabled={!hasMore} onClick={loadMore} label={common('loadMore')} />
      </Grid>
    </>
  );
}