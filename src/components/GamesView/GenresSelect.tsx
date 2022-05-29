import React from "react";
import {useTranslation} from "react-i18next";
import {connect} from 'react-redux';

// React Material UI
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';


import {
    filter_games_by_genre, 
    filter_games_by_title
} 
// @ts-ignore
from "../../actions/games.tsx";

// Genres filter of GamesGallery
function GenresSelect(props) {

    const { genres, selectedGenres } = props;
    const { t } = useTranslation('common');

    // Generate list of values for game genre
    const genre_options = genres
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
            getOptionLabel={(option : any) => option.label}
            isOptionEqualToValue={(option, value) => 
                Array.isArray(value) ? value.some(v => v.key === option.key) : value.key === option.key
            }
            value={selectedGenres.map(genre => ({
                label: t("gamesLibrary.gamesGenres." + genre),
                key: genre
            }))}
            renderInput={(params) => <TextField {...params} label={t("gamesLibrary.filtersLabels.genres")} />}
            onChange={(_event, value) => {
                props.filterByGenre(value.map(v => v.key));
            }}
        />
    </>;
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    genres: state.games.filters.genres,
    selectedGenres: state.games.filters.activeFilters.find(s => s.key === "selected_genres")?.value || []
});

const mapDispatchToProps = {
    filterByGenre: filter_games_by_genre, 
    filterByTitle: filter_games_by_title
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GenresSelect);