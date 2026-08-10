"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ReplayIcon from "@mui/icons-material/Replay";
import { useTranslations } from "next-intl";

interface QueryErrorStateProps {
    /**
     * Called when the user asks to retry the failed query (typically the
     * `refetch` function RTK Query hands back). Omit to hide the retry
     * button if the caller has nothing to retry.
     */
    onRetry?: () => void;
}

/**
 * Shared, translated replacement for the `<>Something bad happened</>`
 * fallback that used to be copy-pasted (hardcoded, untranslated English)
 * across every RTK-Query-backed page in the app.
 */
export default function QueryErrorState({ onRetry }: QueryErrorStateProps) {
    const t = useTranslations("common.errors");

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                py: 6,
                textAlign: "center",
            }}
        >
            <Typography variant="body1" color="text.secondary">
                {t("generic")}
            </Typography>
            {onRetry && (
                <Button
                    variant="outlined"
                    startIcon={<ReplayIcon />}
                    onClick={onRetry}
                >
                    {t("retry")}
                </Button>
            )}
        </Box>
    );
}