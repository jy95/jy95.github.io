import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Link } from '@/i18n/routing';

type Props = { shared: boolean; hasEntries: boolean; hasSelection: boolean; canImport: boolean; encoding: boolean; onImport: () => void; onClear: () => void; onShare: () => void };

export function SelectionActions({ shared, hasEntries, hasSelection, canImport, encoding, onImport, onClear, onShare }: Props) {
    const t = useTranslations('selection');
    return (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {shared ? <>
                {hasEntries && <Button variant="contained" disabled={!canImport || encoding} onClick={onImport}>{t(canImport ? 'import' : 'imported')}</Button>}
                <Button component={Link} href="/selection">{t('openOwn')}</Button>
            </> : hasSelection && <Button startIcon={<DeleteOutlinedIcon />} onClick={onClear}>{t('clear')}</Button>}
            {hasEntries && <Button startIcon={<ShareIcon />} disabled={encoding} onClick={onShare}>{t('share')}</Button>}
        </Stack>
    );
}
