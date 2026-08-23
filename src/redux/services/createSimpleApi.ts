import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export function createSimpleGetApi<TResponse>(reducerPath: string, path: string) {
    return createApi({
        reducerPath,
        baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
        endpoints: (builder) => ({
            get: builder.query<TResponse, void>({ query: () => path })
        })
    });
}