"use client";

// Hooks
import { useTranslations } from "next-intl";

// UI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Types
export interface TierStatsTitle {
    totalGames: number
}

export default function DistributionHeader({ totalGames } : TierStatsTitle) {

    const tStats = useTranslations("stats.tierStats");

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" 
                sx={{
                    fontWeight: "bold"
                }}
            >
                {tStats("distributionTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {tStats('total_games', { count: totalGames })}
            </Typography>
        </Box>
    );
}