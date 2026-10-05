"use client";

import { notFound } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import { QueryBoundary } from "./QueryBoundary";
import type { ReactNode } from "react";

type Props<T> = {
    error: unknown;
    isLoading: boolean;
    data: T | undefined;
    onRetry?: () => void;
    children: (data: T) => ReactNode;
};

export function DetailQueryBoundary<T>(props: Props<T>) {
    const { error } = props;
    if (typeof error === "object" && error !== null && "status" in error && error.status === 404) {
        return notFound();
    }
    return <QueryBoundary {...props} loadingFallback={<CircularProgress />} />;
}
