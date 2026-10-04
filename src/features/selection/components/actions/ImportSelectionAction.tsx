'use client';

import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import { Link } from '@/i18n/routing';

import { hasNewIds, isEmpty } from '@/domain/selection/operations';
import { addSelection } from "@/features/selection/storage/store";

import type { SelectionDocument } from '@/domain/selection/types';

type ImportSelectionActionProps = {
  document: SelectionDocument;
  personal: SelectionDocument;
};

export function ImportSelectionAction({ document, personal }: ImportSelectionActionProps) {
  const t = useTranslations('selection');
  const canImport = hasNewIds(document, personal);

  return (
    <>
      {!isEmpty(document) && (
        <Button variant="contained" disabled={!canImport} onClick={() => addSelection(document)}>
          {t(canImport ? 'import' : 'imported')}
        </Button>
      )}
      <Button component={Link} href="/selection">
        {t('openOwn')}
      </Button>
    </>
  );
}