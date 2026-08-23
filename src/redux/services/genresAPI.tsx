import type { GenreResponse } from "@/app/api/genres/route";
import { api } from "./api"

export const genresAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getGenres: builder.query<GenreResponse, void>({
            query: () => "/genres"
        })
    })
});

export const { useGetGenresQuery } = genresAPI
