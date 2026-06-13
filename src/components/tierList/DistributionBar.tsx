"use client";

// Hooks
import { useTranslations } from "next-intl";

// UI
import Box from "@mui/material/Box";
import DistributionHeader from "./DistributionHeader"
import DistributionSegments from "./DistributionSegments";

// Types
import type { RawType, BackgroundColor } from "./index";

export interface TierStatProps<T extends RawType> {
    data: Record<string, T[]>;
    categoryColors: Record<string, BackgroundColor>;
}

export default function DistributionBar<T extends RawType>({ data, categoryColors }: TierStatProps<T>) {

    const t = useTranslations("TierList.categories");

    // Let find out how many games we have
    const totalGames = Object.values(data).reduce((acc, tier) => acc + tier.length, 0);

    // Useless to display this bar if no games
    if (totalGames === 0) {
        return (<></>);
    }

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <DistributionHeader totalGames={totalGames} />
            <DistributionSegments categoryColors={categoryColors} totalGames={totalGames} data={data}/>
        </Box>
    )

}