"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { useTranslations } from "next-intl";

export interface TierListControlsProps {
    sortOrder: "asc" | "desc";
    onToggleSort: () => void;
}

export function TierListControls({ sortOrder, onToggleSort }: TierListControlsProps) {
    const t = useTranslations("TierList");
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
                variant="outlined"
                onClick={onToggleSort}
                startIcon={<SwapVertIcon />}
            >
                {sortOrder === "asc" ? t("sortAsc") : t("sortDesc")}
            </Button>
        </Box>
    );
}