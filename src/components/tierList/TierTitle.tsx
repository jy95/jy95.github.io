"use client";

// Hooks
import { useTranslations } from "next-intl";

// Styles
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { BackgroundColor } from "./index";

export interface TierTitleProps {
    // A unique identifier for the tier, used for keying and styling purposes.
    slugKey: string;
    // The color associated with this tier
    slugColor: BackgroundColor;
}

export default function TierTitle({ slugKey, slugColor }: TierTitleProps) {

    // Display texts in user's language
    const t = useTranslations("TierList.categories");

    return (
        <Box 
            sx={{ 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: slugColor, 
                borderRadius: 1,
                mr: 1,
                px: 1.5,
                py: 2,
                flex: '0 0 auto',
            }}
        >
            <Typography
                sx={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold'
                }}
            >
                {t(slugKey as any)}
            </Typography>
        </Box>
    );
}