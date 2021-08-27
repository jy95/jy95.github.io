import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from "@material-ui/core/Autocomplete";
import TextField from '@material-ui/core/TextField';

import {
    filter_games_by_genre, 
    filter_games_by_title
} from "../../actions/games";

// Genres filter of GamesGallery
function GenresSelect(props) {

    const { filters } = props;
    const { t } = useTranslation('common');

    // Generate list of values for game genre
    const genre_options = filters
        .genres
        .map(genre => ({
            label: t("gamesLibrary.gamesGenres." + genre),
            key: genre
        }))
        .sort( 
            (a, b) => (a.label < b.label) ? -1 : (a.label > b.label ? 1 : 0) 
        );

    return <>
        <Autocomplete
            multiple
            openOnFocus
            filterSelectedOptions 
            id="select-game-genre"
            //style={{ width: 300 }}
            limitTags={3}
            options={genre_options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
            }
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.genres")} />}
            onChange={(_event, value) => {
                const genres = (value) ? value : [];
                props.filterByGenre(genres);
            }}
            //value={filters.selected_genres}
        />
    </>;
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    filters: state.games.filters,
});

const mapDispatchToProps = {
    filterByGenre: filter_games_by_genre, 
    filterByTitle: filter_games_by_title
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GenresSelect);