// Need to use the React-specific entry point to import createApi
import { createSimpleGetApi } from './createSimpleApi';
import type { serieType } from "@/app/api/series/route";

// Define a service using a base URL and expected endpoints
export const seriesAPI = createSimpleGetApi<serieType[]>('seriesApi', '/series', 'getSeries');

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetSeriesQuery } = seriesAPI