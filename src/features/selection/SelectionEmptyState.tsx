import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from '@/i18n/routing';

export function SelectionEmptyState({ shared }: { shared: boolean }) {
    const t = useTranslations('selection');
    return (
        <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>{t(shared ? 'sharedEmpty' : 'empty')}</Typography>
            <Button component={Link} href="/games" variant="outlined">{t('browse')}</Button>
        </Box>
    );
}
