// Need to use the React-specific entry point to import createApi
import { createSimpleGetApi } from './createSimpleApi';
import type { BacklogEntry } from "@/app/api/backlog/route";

// Define a service using a base URL and expected endpoints
export const backlogAPI = createSimpleGetApi<BacklogEntry[]>('backlogApi', '/backlog', 'getBacklog');

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetBacklogQuery } = backlogAPI