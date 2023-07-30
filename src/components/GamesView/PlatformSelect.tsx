import useTranslation from 'next-translate/useTranslation'

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
import SvgIcon from '@mui/material/SvgIcon';

import { filterByPlatform, selectSelectedPlatform } from "@/redux/services/gamesSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// icons
import iconsSVG from "@/components/GamesView/PlatformIcons";
import type { Platform } from "@/redux/services/sharedDefintion";

const PLATFORMS = [
    "GBA",
    "PC",
    "PS1",
    "PS2",
    "PS3",
    "PSP"
];

type Platform_Entry = {
    label: string;
    id: Platform;
}

function PlatformSelect() {

    const { t } = useTranslation('common');
    const dispatch = useAppDispatch();
    const selectedPlatform = useAppSelector(
        (state) => selectSelectedPlatform(state)
    )

    const options = PLATFORMS
        .map(platform => ({
            label: platform,
            id: platform as Platform
        }))

    return <>
        <Autocomplete<Platform_Entry, false>
            id="select-game-platform"
            openOnFocus
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.id === option.id) : value.id === option.id
            }
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.platform")} />}
            renderOption={(props, option, _state) => (
                <li {...props} key={option.id}>
                    <SvgIcon titleAccess={option.label}>
                        {iconsSVG[option.id as Platform]}
                    </SvgIcon>
                    {option.label}
                </li>
            )}
            onChange={(_event, value) => {
                const platform = (value) ? value.id || value : "";
                dispatch(filterByPlatform(platform));
            }}
            value={
                selectedPlatform ? {
                    id: selectedPlatform as Platform,
                    label: selectedPlatform
                } : null
            }
        />
    </>;
}

export default PlatformSelect;