"use client";

// UI
import Box from "@mui/material/Box";
import DistributionSegment from "./DistributionSegment";

// Types
import type { TierStatProps } from "./DistributionBar";
import type { RawType } from "./index";

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
                        tierSlug={slugKey}  
                        percentage={percentage} 
                        count={count}
                        categoryColors={categoryColors}
                    />
                );
            })}
        </Box>
    );

}