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
        <Box sx={{
            backgroundColor: slugColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            minWidth: '120px',
            width: '120px',
            flexShrink: 0,
            p: 1,
        }}>
            <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    maxHeight: '100%',
                    lineHeight: 1.2,
                }}
            >
                {t(slugKey as any)}
            </Typography>
        </Box>
    );
}
