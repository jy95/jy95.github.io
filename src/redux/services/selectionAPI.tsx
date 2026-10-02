import type { SelectionEntry } from "@/features/selection/catalogue";
import { api } from "./api"

export const selectionAPI = api.injectEndpoints({
    endpoints: (builder) => ({
        getSelectionCatalogue: builder.query<SelectionEntry[], void>({
            query: () => "/selection"
        })
    })
});

export const { useGetSelectionCatalogueQuery } = selectionAPI