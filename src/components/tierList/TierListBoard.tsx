"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import { TierRow } from "./TierRow";
import type { RawType, GameRender, BackgroundColor } from "./index";
import type { TierCategoryKey } from "@/types/tierList";

interface TierListBoardProps<T extends RawType> {
    categories: TierCategoryKey[];
    data: Record<string, T[]>;
    categoryColors: Record<string, BackgroundColor>;
    GameRender: GameRender<T>;
    skipEmptyCategories?: boolean;
}

export function TierListBoard<T extends RawType>({ 
    categories, 
    data, 
    categoryColors, 
    GameRender,
    skipEmptyCategories = false
}: TierListBoardProps<T>) {

    const visibleCategories = useMemo(() => {
        if (!skipEmptyCategories) return categories;
        return categories.filter((slug) => data[slug] && data[slug].length > 0);
    }, [categories, data, skipEmptyCategories]);

    return (
        <Box data-testid="tier-list-board" sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {visibleCategories.map((categorySlug) => {
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