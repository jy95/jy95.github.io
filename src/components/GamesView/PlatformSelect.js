import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import SvgIcon from '@material-ui/core/SvgIcon';

import {
    filter_games_by_platform
} from "../../actions/games";

// icons
import iconsSVG from "./PlatformIcons";

function PlatformSelect(props) {

    const { filters } = props;
    const { t } = useTranslation('common');

    const options = filters
        .platforms
        .map(platform => ({
            label: platform,
            key: platform
        }))

    return (
        <>
            <Autocomplete
                id="select-game-platform"
                openOnFocus
                options={options}
                getOptionLabel={(option) => option.label}
                getOptionSelected={(option, value) => 
                    Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
                }
                renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.platform")} variant="outlined" />}
                renderOption={(option, _state) => (
                    <>
                        <SvgIcon titleAccess={option.label}>
                            <path d={iconsSVG[option.key]} />
                        </SvgIcon>
                        {option.label}
                    </>
                )}
                onChange={(_event, value) => {
                    const platform = (value) ? value.key : "";
                    props.filterByPlatform(platform);
                }}
                //value={filters.selected_genres}
            />
        </>
    );
}


// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    filters: state.games.filters,
});

const mapDispatchToProps = {
    filterByPlatform: filter_games_by_platform, 
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlatformSelect);