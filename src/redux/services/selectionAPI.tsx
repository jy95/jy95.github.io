import type { SelectionEntry } from "@/domain/selection/types";
import { api } from "./api"

export const selectionAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getSelectionCatalogue: builder.query<SelectionEntry[], void>({
            query: () => "/selection"
        })
    })
});

export const { useGetSelectionCatalogueQuery } = selectionAPI