import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
import SvgIcon from '@mui/material/SvgIcon';

import { filterByPlatform } from "../../services/gamesSlice";
import type { RootState, AppDispatch } from '../Store';

// icons
import iconsSVG from "./PlatformIcons";
import type { Platform } from "../../services/sharedDefintion";

const PLATFORMS = [
    "GBA",
    "PC",
    "PS1",
    "PS2",
    "PS3",
    "PSP"
];

function PlatformSelect(_props : {[key: string | number | symbol] : any}) {

    const { t } = useTranslation('common');
    const dispatch: AppDispatch = useDispatch();
    const selectedPlatform : string  = useSelector(
        (state: RootState) => (state.games.activeFilters.find((s => s.key === "selected_platform")) as {
            key: "selected_platform";
            value: string
        } | undefined)?.value
    ) || "";

    const options = PLATFORMS
        .map(platform => ({
            label: platform,
            key: platform
        }))

    return <>
        <Autocomplete
            id="select-game-platform"
            openOnFocus
            options={options}
            getOptionLabel={(option: any) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
            }
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.platform")} />}
            renderOption={(props, option, _state) => (
                <li {...props} key={option.key}>
                    <SvgIcon titleAccess={option.label}>
                        {iconsSVG[option.key as Platform]}
                    </SvgIcon>
                    {option.label}
                </li>
            )}
            onChange={(_event, value) => {
                const platform = (value) ? (value as {[key: string]: any})?.key || value : "";
                dispatch(filterByPlatform(platform));
            }}
            value={
                selectedPlatform ? {
                    key: selectedPlatform,
                    label: selectedPlatform
                } : null
            }
        />
    </>;
}

export default PlatformSelect;