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
        <Box sx={{ backgroundColor: slugColor, alignItems: 'center', justifyContent: 'center', borderRadius: 1, mb: 2 }}>
            <Typography>{t(slugKey as any)}</Typography>
        </Box>
    );
}