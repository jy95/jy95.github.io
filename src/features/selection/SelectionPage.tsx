'use client';

// Hooks
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

// MUI
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Rest
import { detailSections } from '@/domain/games/details';
import { resolveSelection } from '@/domain/selection/resolution';
import { usePersonalSelection } from './storage/hooks';
import { decodeSelection } from './sharing/sharing';
import { SelectionActions } from './SelectionActions';
import { SelectionGrid } from './SelectionGrid';

// Types
import type { SelectionDocument, SelectionEntry } from '@/domain/selection/types';

// Heavy (votes/Supabase, related games): load on demand.
const GameDetailView = lazy(() => import('@/features/games/detail/GameDetailView'));

type SharedState =
  | { status: 'none' | 'loading' | 'error' }
  | { status: 'ready'; document: SelectionDocument };

const NONE: SharedState = { status: 'none' };
const LOADING: SharedState = { status: 'loading' };
const ERROR: SharedState = { status: 'error' };

/** Decodes `?entries=`. A shared selection never touches personal storage. */
function useSharedSelection(param: string | null): SharedState {
  const [result, setResult] = useState<{ param: string; state: SharedState } | null>(null);

  useEffect(() => {
    if (param === null) return;
    let active = true;

    void decodeSelection(param).then(doc => {
      if (active) {
        setResult({ param, state: doc ? { status: 'ready', document: doc } : ERROR });
      }
    });

    return () => { active = false; };
  }, [param]);

  if (param === null) return NONE;
  return result?.param === param ? result.state : LOADING;
}

function getShownDocument(shared: SharedState, personalDoc: SelectionDocument): SelectionDocument | null {
  if (shared.status === 'ready') return shared.document;
  return shared.status === 'none' ? personalDoc : null;
}

function Header({ shared }: { shared: boolean }) {
  const t = useTranslations('selection');
  return (
    <>
      <Typography variant="h4" component="h1">
        {t(shared ? 'sharedTitle' : 'title')}
      </Typography>
      <Typography color="text.secondary">
        {t(shared ? 'sharedDescription' : 'description')}
      </Typography>
    </>
  );
}

type NoticesProps = {
  storageAvailable: boolean;
  invalid: boolean;
  count: number;
  missingCount: number;
};

function Notices({ storageAvailable, invalid, count, missingCount }: NoticesProps) {
  const t = useTranslations('selection');
  return (
    <>
      {!storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
      {invalid && <Alert severity="error">{t('invalid')}</Alert>}
      <Typography role="status" aria-live="polite">
        {t('count', { count })}
      </Typography>
      {missingCount > 0 && (
        <Alert severity="info">{t('unavailable', { count: missingCount })}</Alert>
      )}
    </>
  );
}

export default function SelectionPage({ catalogue }: { catalogue: SelectionEntry[] }) {
  const common = useTranslations('common');
  const searchParams = useSearchParams();
  const shared = useSharedSelection(searchParams.get('entries'));
  const personal = usePersonalSelection();
  const [detail, setDetail] = useState<SelectionEntry | null>(null);

  const activeDocument = getShownDocument(shared, personal.document);

  // Résolution catalogue : le document source reste intact
  const resolved = useMemo(() => {
    if (!activeDocument) return null;
    return resolveSelection(catalogue, activeDocument);
  }, [catalogue, activeDocument]);

  if (!personal.hydrated || shared.status === 'loading') {
    return <CircularProgress aria-label={common('loading')} />;
  }

  const isShared = shared.status !== 'none';
  const currentDocument = resolved?.document ?? personal.document;
  const entries = resolved?.entries ?? [];
  const missingCount = resolved?.missing ? resolved.missing.length : 0;

  return (
    <Stack spacing={2}>
      <Header shared={isShared} />
      <Notices
        storageAvailable={personal.storageAvailable}
        invalid={shared.status === 'error'}
        count={entries.length}
        missingCount={missingCount}
      />
      <SelectionActions
        shared={isShared}
        document={currentDocument}
        personal={personal.document}
      />
      {shared.status !== 'error' && (
        <SelectionGrid entries={entries} shared={isShared} onDetail={setDetail} />
      )}
      {detail && (
        <Suspense fallback={null}>
          <GameDetailView
            category={detail.category}
            game={detail.game}
            onClose={() => setDetail(null)}
            {...detailSections(detail.source)}
          />
        </Suspense>
      )}
    </Stack>
  );
}