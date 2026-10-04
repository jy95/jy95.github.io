import { useTranslations } from 'next-intl';
import Typography from '@mui/material/Typography';

export function SelectionHeader({ shared }: { shared: boolean }) {
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

