"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SwapVertIcon from "@mui/icons-material/SwapVert";

interface TierListControlsProps {
    sortOrder: "asc" | "desc";
    onToggleSort: () => void;
}

export function TierListControls({ onToggleSort }: TierListControlsProps) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button 
                variant="outlined" 
                onClick={onToggleSort}
                startIcon={<SwapVertIcon />}
            />
        </Box>
    );
}