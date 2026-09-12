import { NextResponse } from "next/server";

export const STATIC_CACHE_HEADERS = {
    "Cache-Control": "public, max-age=86400, must-revalidate"
} as const;

export function cachedJson<T>(data: T, init?: ResponseInit) {
    return NextResponse.json(data, {
        ...init,
        headers: { ...STATIC_CACHE_HEADERS, ...init?.headers }
    });
}