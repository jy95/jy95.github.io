import type { PlatformsResponse } from "@/app/api/platforms/route";
import { api } from "./api"

export const platformsAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getPlatforms: builder.query<PlatformsResponse, void>({
            query: () => "/platforms"
        })
    })
});

export const { useGetPlatformsQuery } = platformsAPI
