// https://next-intl-docs.vercel.app/docs/environments/error-files#not-foundjs

// Hooks
import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';

// https://next-intl-docs.vercel.app/docs/routing/navigation
import { Link } from '@/i18n/routing';

// Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

type Props = {
    params: Promise<{
      locale: "en" | "fr"
    }>
  }

export default async function NotFoundPage({ params }: Props) {

    const locale = (await params).locale;

    // Enable static rendering
    setRequestLocale(locale);

    const t = useTranslations('notFound');

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "80vh"
            }}>
            <Typography variant="h4" gutterBottom>{t('title')}</Typography>
            <Link href="/">
                <Button variant="contained" color="primary">
                    {t('goGome')}
                </Button>
            </Link>
        </Box>
    );
}