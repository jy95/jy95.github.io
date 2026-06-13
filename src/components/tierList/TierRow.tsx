"use client";

// Styles
import Box from "@mui/material/Box";

// Components
import TierTitle from "./TierTitle";
import GamesRow from "./GamesRow";

// Types
import type { GameRender, RawType, BackgroundColor } from "./index";

export interface TierRowProps<T extends RawType> {
    // A unique identifier for the tier row, used for keying and styling purposes.
    slugKey: string;
    // An array of items that belong to this tier. The type T can be defined by the parent component to allow for flexibility in the kind of data being displayed.
    items: T[];
    // The color associated with this tier
    slugColor: BackgroundColor;
    // A function that renders each game item
    GameRender: GameRender<T>;
}

export function TierRow<T extends RawType>({ slugKey, items, slugColor, GameRender }: TierRowProps<T>) {

    return (
        <Box sx={{ display: 'flex', mb: 1, minHeight: '120px', border: '1px solid', borderColor: 'divider' }}>
            <TierTitle slugKey={slugKey} slugColor={slugColor} />
            <Box sx={{ flex: 1, p: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                <GamesRow items={items} GameRender={GameRender} />
            </Box>
        </Box>
    );

}