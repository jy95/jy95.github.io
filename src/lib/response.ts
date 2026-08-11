import { NextResponse } from "next/server";
import type { NextResponseInit } from "next/server";

export const DEFAULT_CACHE = "public, s-maxage=86400, stale-while-revalidate=3600";

export const DEFAULT_INIT: NextResponseInit = {
  headers: {
    "Cache-Control": DEFAULT_CACHE,
  },
};

export function jsonWithCache(body: unknown, init: NextResponseInit = {}) {
  // Merge defaults with user-provided init; user-provided fields (including headers) override defaults.
  const mergedInit: NextResponseInit = {
    ...DEFAULT_INIT,
    ...init,
    headers: {
      ...(DEFAULT_INIT.headers as Record<string, string>),
      ...(init.headers as Record<string, string> | undefined),
    },
  };

  return NextResponse.json(body, mergedInit);
}
