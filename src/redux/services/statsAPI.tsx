// Need to use the React-specific entry point to import createApi
import { createSimpleGetApi } from './createSimpleApi';
import type { statsProperty } from "@/app/api/stats/route";

// Define a service using a base URL and expected endpoints
export const statsAPI = createSimpleGetApi<statsProperty>('statsApi', '/stats');

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetQuery: useGetStatsQuery } = statsAPI