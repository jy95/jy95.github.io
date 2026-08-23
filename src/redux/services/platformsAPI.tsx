// Need to use the React-specific entry point to import createApi
import { createSimpleGetApi } from './createSimpleApi';
import type { PlatformsResponse } from "@/app/api/platforms/route";

// Define a service using a base URL and expected endpoints
export const platformsAPI = createSimpleGetApi<PlatformsResponse>('platformsApi', '/platforms');

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetQuery: useGetPlatformsQuery } = platformsAPI