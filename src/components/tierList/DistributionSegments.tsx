"use client";

// UI
import Box from "@mui/material/Box";
import DistributionSegment from "./DistributionSegment";

// Types
import type { TierStatProps } from "./DistributionBar";
import type { RawType } from "./index";
import type { TierCategoryKey } from "@/types/tierList";

type DistributionSegmentsProps = TierStatProps<RawType> & {
    totalGames: number
};

export default function DistributionSegments({ data, categoryColors, totalGames } : DistributionSegmentsProps){

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                height: 12, 
                borderRadius: 2, 
                overflow: 'hidden', 
                backgroundColor: 'divider' 
            }}
        >
            {Object.entries(data).map(([slugKey, games]) => {
                const count = games.length;
                const percentage = (count / totalGames) * 100;
                return (
                    <DistributionSegment 
                        key={slugKey}
                        // `data` is typed as a generic `Record<string, T[]>` so this
                        // component can be reused for games/backlog/tests tier lists,
                        // but at runtime its keys are always tier category slugs (the
                        // JSON files and `categoryColors` default are keyed by exactly
                        // `TierCategoryKey`). Narrowing here — once, at this boundary —
                        // keeps DistributionSegment and the translation call it makes
                        // fully typed instead of falling back to `as any`.
                        tierSlug={slugKey as TierCategoryKey}
                        percentage={percentage} 
                        count={count}
                        categoryColors={categoryColors}
                    />
                );
            })}
        </Box>
    );

}