"use client";

import { use } from "react";

export function useDetailRouteId(params: Promise<{ id: string }>): string {
    return use(params).id;
}
