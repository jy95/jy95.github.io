"use client";

// Hooks
import { useTranslations } from "next-intl";
import { useGetPlatformsQuery } from "@/redux/services/platformsAPI";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";

import { renderAutocompleteInput } from "./renderAutocompleteInput";

import type { Platform_Entry } from "@/app/api/platforms/route";

type Props = { value?: number; onChange: (platform: number | undefined) => void };

function PlatformSelect({ value: selectedPlatform, onChange }: Props) {

    const t = useTranslations("gamesLibrary.filtersLabels")
    const { data, isFetching } = useGetPlatformsQuery();

    return (
        <Autocomplete<Platform_Entry, false>
            id="select-game-platform"
            openOnFocus
            options={data || []}
            loading={isFetching}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => value.id === option.id}
            renderInput={renderAutocompleteInput(t("platform"))}
            renderOption={(props, option) => (
                <li {...props} key={option.name}>
                    {option.name}
                </li>
            )}
            onChange={(_event, value) => {
                const platform = (value) ? value.id : undefined;
                onChange(platform);
            }}
            value={
                selectedPlatform !== undefined ? {
                    id: selectedPlatform,
                    name: (data || [] ).find(p => p.id === selectedPlatform)?.name || ""
                } : null
            }
        />
    );
}

export default PlatformSelect;
