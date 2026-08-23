import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export function createSimpleGetApi<
    TResponse,
    ReducerPath extends string,
    EndpointName extends string
>(
    reducerPath: ReducerPath,
    path: string,
    endpointName: EndpointName
) {
    return createApi({
        reducerPath,
        baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
        endpoints: (builder) => ({
            [endpointName]: builder.query<TResponse, void>({ query: () => path })
        } as Record<EndpointName, ReturnType<typeof builder.query<TResponse, void>>>)
    });
}