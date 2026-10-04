import { useMemo, useState } from 'react';

import { useGamesFilters } from '@/features/games/useGamesFilters';
import { browseGames } from '@/lib/browseGames';

import { SelectionResults } from './SelectionResults';
import { SelectionEmptyState } from './SelectionEmptyState';
import { SelectionFilters } from './SelectionFilters';

// Types
import type { SelectionKind, SelectionEntry } from "@/domain/selection/types";

type SelectionGridProps = {
  entries: SelectionEntry[];
  shared: boolean;
  onDetail: (entry: SelectionEntry) => void;
};

/** Pure presentation: kind, catalogue filters, sort and paging never touch the stored selection. */
export function SelectionGrid({ entries, shared, onDetail }: SelectionGridProps) {
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
      <SelectionResults entries={shown} shared={shared} onDetail={onDetail} />
    </>
  );
}
