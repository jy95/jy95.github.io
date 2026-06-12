"use client";

// Styles
import Box from "@mui/material/Box";

// Components
import TierTitle from "./TierTitle";
import GamesRow from "./GamesRow";

// Types
import type { GameRender, RawType } from "./index";

export interface TierRowProps<T extends RawType> {
    // A unique identifier for the tier row, used for keying and styling purposes.
    slugKey: string;
    // An array of items that belong to this tier. The type T can be defined by the parent component to allow for flexibility in the kind of data being displayed.
    items: T[];
    // The color associated with this tier
    slugColor: string;
    // A function that renders each game item
    GameRender: GameRender<T>;
}

export default function TierRow<T extends RawType>({ slugKey, items, slugColor, GameRender }: TierRowProps<T>) {

    return (
        <Box sx={{ display: 'flex', mb: 2, minHeight: '180px' }}>
            <TierTitle slugKey={slugKey} slugColor={slugColor} />
            <GamesRow items={items} GameRender={GameRender} />
        </Box>
    );

}