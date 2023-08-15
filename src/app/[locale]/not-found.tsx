"use client";

// https://next-intl-docs.vercel.app/docs/environments/error-files#not-foundjs

// Hooks
import {useTranslations} from 'next-intl';

// https://next-intl-docs.vercel.app/docs/routing/navigation
import Link from 'next-intl/link';

// Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


export default function NotFoundPage() {

    const t = useTranslations('notFound');

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="80vh"
        >
            <Typography variant="h4" gutterBottom>{t('title')}</Typography>
            <Link href="/">
                <Button variant="contained" color="primary">
                    {t('goGome')}
                </Button>
            </Link>
        </Box>
    )
}