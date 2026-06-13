"use client";

// Hooks
import { useTranslations } from "next-intl";

// UI
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

import type { BackgroundColor } from "./index";

// Types
export interface DistributionSegmentProps {
    tierSlug: string;
    count: number;
    percentage: number;
    categoryColors: Record<string, BackgroundColor>;
}

export default function DistributionSegment({ tierSlug, count, percentage, categoryColors }: DistributionSegmentProps) {

    const tStats = useTranslations("stats.tierStats");
    const tCats = useTranslations("TierList.categories");

    const tooltipText = tStats('tooltip', { 
        category: tCats(tierSlug as any), 
        count: count, 
        percentage: Math.round(percentage) 
    });

    const slugColor : BackgroundColor = categoryColors[tierSlug] ?? "grey";

    return (
        <Tooltip title={tooltipText} arrow placement="top">
            <Box
                sx={{
                    width: `${percentage}%`,
                    backgroundColor: slugColor,
                    transition: 'width 0.4s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                }}
            />
        </Tooltip>
    )
}