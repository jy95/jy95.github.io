import { useTranslations } from 'next-intl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LoadingButton from '@/app/[locale]/games/_client/LoadingButton';
import { usePagedSlice } from '@/hooks/usePagedSlice';
import type { SelectionEntry } from '@/domain/selection/types';
import { SelectionCards } from './SelectionCards';

type SelectionResultsProps = {
  entries: SelectionEntry[];
  shared: boolean;
  onDetail: (entry: SelectionEntry) => void;
};

/** The memoized browsing result controls when pagination resets. */
export function SelectionResults({ entries, shared, onDetail }: SelectionResultsProps) {
  const common = useTranslations('common');
  const { visible, hasMore, loadMore } = usePagedSlice(entries, 12);

  return (
    <>
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
