"use client";

import { Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
    /**
     * What to render while `children` suspends. Defaults to a centered
     * spinner. Pass `null` (or use `SilentSuspenseBoundary`) for a boundary
     * that only exists to satisfy Next's "missing Suspense with CSR
     * bailout" requirement around `useSearchParams`, where showing loading
     * UI would just be visual noise.
     */
    fallback?: ReactNode;
};

/**
 * Single source of truth for the "wrap in Suspense to avoid Next's CSR
 * bailout on useSearchParams" pattern. Before this, the same problem was
 * solved ad hoc with four different fallbacks (`<></>`, `null`, a bespoke
 * local `GridLoadingFallback` duplicated in two files, ...) spread across
 * `AppProviderCustom`, `RandomButton`, `PlanningViewerClient`, and
 * `BacklogViewerClient` — nothing forced a new component to remember the
 * pattern existed at all.
 */
export function SuspenseBoundary({ children, fallback = <DefaultFallback /> }: Props) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
}

function DefaultFallback() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
        </Box>
    );
}

/** Silent variant for boundaries that shouldn't show any loading UI. */
export function SilentSuspenseBoundary({ children }: { children: ReactNode }) {
    return <SuspenseBoundary fallback={null}>{children}</SuspenseBoundary>;
}