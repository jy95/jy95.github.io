import { memo } from 'react';
import Grid from '@mui/material/Grid';
import { SelectionCard } from './SelectionCard';
import type { SelectionEntry } from "@/domain/selection/types";

type SelectionCardsProps = {
  entries: SelectionEntry[];
  selectable?: boolean;
  onDetail: (entry: SelectionEntry) => void;
};

export const SelectionCards = memo(function SelectionCards({
  entries,
  onDetail,
  selectable = true,
}: SelectionCardsProps) {
  return (
    <Grid container spacing={1} rowSpacing={1}>
      {entries.map(entry => (
        <Grid key={`${entry.category}:${entry.selectionId}`} size={{ xs: 6, md: 4, lg: 2 }}>
          <SelectionCard selectable={selectable} entry={entry} onDetail={onDetail} />
        </Grid>
      ))}
    </Grid>
  );
});