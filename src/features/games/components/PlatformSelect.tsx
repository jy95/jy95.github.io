// Hooks
import { useTranslations } from "next-intl";
import { useGetPlatformsQuery } from "@/redux/services/platformsAPI";

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";

import { renderAutocompleteInput } from "./renderAutocompleteInput";

import type { ChipTypeMap } from "@mui/material/Chip";
import type { Platform_Entry } from "@/app/api/platforms/route";

type Props = { value?: number; onChange: (platform: number | undefined) => void };

function PlatformSelect({ value: selectedPlatform, onChange }: Props) {

    const t = useTranslations("gamesLibrary.filtersLabels")
    const { data, isFetching } = useGetPlatformsQuery();

    return (
        <Autocomplete<Platform_Entry, false, false, false, ChipTypeMap['defaultComponent'], number>
            id="select-game-platform"
            openOnFocus
            options={data || []}
            loading={isFetching}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            renderInput={renderAutocompleteInput(t("platform"))}
            renderOption={(props, option) => (
                <li {...props} key={option.name}>
                    {option.name}
                </li>
            )}
            onChange={(_event, platform) => onChange(platform ?? undefined)}
            value={
                selectedPlatform !== undefined && data?.some(platform => platform.id === selectedPlatform) ? selectedPlatform : null
            }
        />
    );
}

export default PlatformSelect;
