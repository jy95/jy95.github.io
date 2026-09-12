import { NextResponse } from "next/server";

export const STATIC_CACHE_HEADERS = {
    "Cache-Control": "public, max-age=86400, must-revalidate"
} as const;

export function cachedJson<T>(data: T, init?: ResponseInit) {
    const headers = new Headers(init?.headers);
    Object.entries(STATIC_CACHE_HEADERS).forEach(([key, value]) => {
        if (!headers.has(key)) headers.set(key, value);
    });

    return NextResponse.json(data, {
        ...init,
        headers
    });
}
