import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { MissingEntriesNotice } from './MissingEntriesNotice';
import type { SelectionIdentifier } from '@/domain/selection/types';

type NoticesProps = {
    storageAvailable: boolean;
    invalid: boolean;
    count: number;
    missing: SelectionIdentifier[];
    shared: boolean;
};

export function SelectionNotices({ storageAvailable, invalid, count, missing, shared }: NoticesProps) {
    const t = useTranslations('selection');

    return (
        <>
            {!storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
            {invalid && <Alert severity="error">{t(shared ? 'invalid' : 'storageInvalid')}</Alert>}
            <Typography role="status" aria-live="polite">
                {t('count', { count })}
            </Typography>
            <MissingEntriesNotice missing={missing} shared={shared} />
        </>
    );
}

