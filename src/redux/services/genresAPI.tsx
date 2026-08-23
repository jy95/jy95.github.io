// Need to use the React-specific entry point to import createApi
import { createSimpleGetApi } from './createSimpleApi';
import type { GenreResponse } from "@/app/api/genres/route";

// Define a service using a base URL and expected endpoints
export const genresAPI = createSimpleGetApi<GenreResponse>('genresApi', '/genres');

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetQuery: useGetGenresQuery } = genresAPI;