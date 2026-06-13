"use client";

import Box from "@mui/material/Box";
import { TierRow } from "./TierRow";
import type { RawType, GameRender, BackgroundColor } from "./index";

interface TierListBoardProps<T extends RawType> {
    categories: string[];
    data: Record<string, T[]>;
    categoryColors: Record<string, BackgroundColor>;
    GameRender: GameRender<T>;
}

export function TierListBoard<T extends RawType>({ 
    categories, 
    data, 
    categoryColors, 
    GameRender 
}: TierListBoardProps<T>) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {categories.map((categorySlug) => {
                const itemsForCategory = data[categorySlug] || [];
                const slugColor = categoryColors[categorySlug] || "grey";

                return (
                    <TierRow
                        key={categorySlug}
                        slugKey={categorySlug}
                        items={itemsForCategory}
                        slugColor={slugColor}
                        GameRender={GameRender}
                    />
                );
            })}
        </Box>
    );
}