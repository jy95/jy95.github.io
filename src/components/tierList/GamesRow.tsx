"use client";

// Hooks
import { useTranslations } from "next-intl";

// Styles
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Types
import type { RawType, GameRender } from "./index";

export interface GamesRowProps<T extends RawType> {
    // An array of items that belong to this games row.
    items: T[];
    // A function that renders each game item
    GameRender: GameRender<T>;
}

export default function GamesRow<T extends RawType>({ items, GameRender }: GamesRowProps<T>) {

    // Display texts in user's language
    const t = useTranslations("TierList");

    // If there are no items in this games row, display a message indicating that it's empty.
    if (items.length === 0) {
        return (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                    {t("empty")}
                </Typography>
            </Box>
        );
    }

    // If there are items in this games row, render them as needed.
    return (
        <Box sx={{ flex: 1, gap: 1 }}>
            {items.map( (game, idx) => <GameRender key={game?.id ?? idx} game={game} />) }
        </Box>
    );
}