import QueryErrorState from "./QueryErrorState";

import type { ReactNode } from "react";

type Props<T> = {
    error: unknown;
    isLoading: boolean;
    data: T | undefined;
    onRetry?: () => void;
    loadingFallback?: ReactNode;
    children: (data: T) => ReactNode;
};

export function QueryBoundary<T>({ 
    error, 
    isLoading, 
    data, 
    onRetry, 
    loadingFallback = null, 
    children 
}: Props<T>) {
    if (error) return <QueryErrorState onRetry={onRetry} />;
    if (isLoading) return <>{loadingFallback}</>;
    if (!data) return null;
    return <>{children(data)}</>;
}