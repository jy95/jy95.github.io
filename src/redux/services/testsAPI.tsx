import type { TestsResponse } from "@/app/api/tests/route";
import { api } from "./api"

type Parameters = {
    limit?: number,
    offset?: number
}

export const testsAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getTests: builder.query<TestsResponse, Parameters>({
            query: (params) => {
                const stringParams: Record<string, string> = {};
                if (params.limit !== undefined) stringParams.limit = params.limit.toString();
                if (params.offset !== undefined) stringParams.offset = params.offset.toString();
                const query = new URLSearchParams(stringParams);
                return `/tests?${query.toString()}`;
            }
        })
    })
});

export const { useGetTestsQuery } = testsAPI;
