"use client";

import { Link } from '@/i18n/routing';

import { Box, Typography, Link as MuiLink } from '@mui/material';

export default function Branding() {
    return (
        <Box sx={{ alignItems: 'center', gap: 1, display: 'flex' }}>
            <Typography variant="h6" component="div">
                <MuiLink component={Link} href="/" underline="none">
                    GamesPassionFR
                </MuiLink>
            </Typography>
        </Box>
    );
}