// Need to use the React-specific entry point to import createApi
import { createSimpleGetApi } from './createSimpleApi';
import type { dlcType } from "@/app/api/dlcs/route";

// Define a service using a base URL and expected endpoints
export const dlcsAPI = createSimpleGetApi<dlcType[]>('dlcsApi', '/dlcs', 'getDLCs');

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetDLCsQuery } = dlcsAPI