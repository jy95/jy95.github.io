"use client";

import { Link } from '@/i18n/routing';

import { Box, Typography, Link as MuiLink } from '@mui/material';

export default function Branding() {
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="div">
                <MuiLink component={Link} href="/" underline="none">
                    GamesPassionFR
                </MuiLink>
            </Typography>
        </Box>
    );
}