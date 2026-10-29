import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

type NoticesProps = {
    storageAvailable: boolean;
    invalid: boolean;
    count: number;
    shared: boolean;
};

export function SelectionNotices({ storageAvailable, invalid, count, shared }: NoticesProps) {
    const t = useTranslations('selection');

    return (
        <>
            {!storageAvailable && <Alert severity="warning">{t('storageUnavailable')}</Alert>}
            {invalid && <Alert severity="error">{t(shared ? 'invalid' : 'storageInvalid')}</Alert>}
            <Typography role="status" aria-live="polite">
                {t('count', { count })}
            </Typography>
        </>
    );
}

