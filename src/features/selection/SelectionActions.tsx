import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Link } from '@/i18n/routing';

type Props = { shared: boolean; hasEntries: boolean; hasSelection: boolean; canImport: boolean; encoding: boolean; onImport: () => void; onClear: () => void; onShare: () => void };

export function SelectionActions({ shared, hasEntries, hasSelection, canImport, encoding, onImport, onClear, onShare }: Props) {
    const t = useTranslations('selection');

    const canImportShared = shared && hasEntries && canImport && !encoding;
    const showClear = !shared && hasSelection;
    const showShare = hasEntries && !encoding;

    return (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {shared ? (
                <>
                    {canImportShared && (
                        <Button variant="contained" onClick={onImport}>
                            {t('import')}
                        </Button>
                    )}
                    {!canImportShared && hasEntries && (
                        <Button variant="contained" disabled>
                            {t('imported')}
                        </Button>
                    )}
                    <Button component={Link} href="/selection">
                        {t('openOwn')}
                    </Button>
                </>
            ) : (
                showClear && (
                    <Button startIcon={<DeleteOutlinedIcon />} onClick={onClear}>
                        {t('clear')}
                    </Button>
                )
            )}

            {showShare && (
                <Button startIcon={<ShareIcon />} onClick={onShare}>
                    {t('share')}
                </Button>
            )}
        </Stack>
    );
}
