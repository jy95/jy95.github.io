"use client";

import { useState } from "react";
import { useGetSortedCategoriesQuery } from "@/redux/services/tierListAPI";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { TierListControls } from "./TierListControls";
import { TierListBoard } from "./TierListBoard";
import DistributionBar from "./DistributionBar";
import DisclaimerAccordion from "./DisclaimerAccordion";

import type { RawType, GameRender, BackgroundColor } from "./index";

export interface TierListsProps<T extends RawType> {
    data?: Record<string, T[]>;
    isLoadingData?: boolean;
    GameRender: GameRender<T>;
    categoryColors?: Record<string, BackgroundColor>;
}

export function TierLists<T extends RawType>({ 
    data = {}, 
    isLoadingData = false, 
    GameRender, 
    categoryColors = {
        'tier_masterpiece': '#FF6B6B',    
        'tier_excellent': '#FF8C42',      
        'tier_good': '#6BCB77',           
        'tier_average': '#FFD93D',
        'tier_poor': '#4D96FF',           // blue
        'tier_bad': '#9D4EDD',            // purple
        'tier_not_evaluated': '#A0A0A0',  
    }
}: TierListsProps<T>) {

    // local state for sorting
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // API call for categories
    const { data: categories, isLoading: isLoadingCategories } = useGetSortedCategoriesQuery(sortOrder);
    const toggleSort = () => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));

    // When loading
    if (isLoadingData || isLoadingCategories) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    // If no categories was found
    if (!categories || categories.length === 0) {
        return (<></>);
    }

    return (
        <>
            <TierListControls 
                sortOrder={sortOrder} 
                onToggleSort={toggleSort} 
            />
            <DistributionBar 
                categoryColors={categoryColors}
                data={data}
            />
            <DisclaimerAccordion categoryColors={categoryColors}/>
            <TierListBoard 
                categories={categories}
                data={data}
                categoryColors={categoryColors}
                GameRender={GameRender}
            />
        </>
    )

}