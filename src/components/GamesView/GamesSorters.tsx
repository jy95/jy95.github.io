import React from "react";
import {useTranslation} from "react-i18next";

import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

// For sorting criteria reorder
// Not used as it produces a bug
//import ButtonGroup from '@mui/material/ButtonGroup';
//import Switch from '@mui/material/Switch';

// To display ASC / DESC
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// To move sort
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import {connect} from 'react-redux';
// @ts-ignore
import {sort_games, change_sorting_order} from "../../actions/games.tsx";


// Sort buttons of GamesGallery
function GamesSorters(props) {
    
    // To handle criteria enabling (or disabling)
    const handleSortChange = (event) => {
        const field = event.target.name;
        props.sort_games(field);
    }

    // To handle sort criteria 
    const handleSortOrderChange = (event) => {
        // Warning : using IconButton, event.target doesn't work as expected
        const metadata = event.currentTarget;
        // fetch info
        const field = metadata.name;
        const type_of_sort_change = metadata.getAttribute("aria-label");
        const direction = (type_of_sort_change === "upSorter") ? "up" : "down";
        props.change_sorting_order(field, direction);
    }

    const { state: sorters } = props;
    const { t } = useTranslation('common');

    // For Popover
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const open = Boolean(anchorEl);
    const id = open ? 'sort-popover' : undefined;

    // map field to labels in translation file(s)
    const field_labels = {
        "name": "gamesLibrary.sortLabels.byName",
        "releaseDate": "gamesLibrary.sortLabels.byReleaseDate",
        "duration": "gamesLibrary.sortLabels.byDuration"
    }
    // labels for sort buttons (with condition)
    const sort_button_conditions = {
        "upSorter": (index) => index !== 0,
        "downSorter": (index) => index !== sorters.keys.length -1,
    }

    return <>
        <Button aria-describedby={id} variant="contained" onClick={handleClick}>
            {t("gamesLibrary.sortButtonLabel")}
        </Button>
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <FormControl component="fieldset" variant="standard">
                <FormGroup>
                    {
                        sorters
                            .keys
                            .map( (criteria, index) => 
                                <div
                                    key={"searchCriteria_"+criteria}
                                >
                                    <FormControlLabel
                                        control={
                                            <>
                                                <Checkbox 
                                                    checked={sorters.state[criteria] !== "ASC"}
                                                    onChange={handleSortChange}
                                                    name={criteria}
                                                    checkedIcon={<ArrowDropUpIcon />}
                                                    icon={<ArrowDropDownIcon />} 
                                                />
                                            </>
                                        }
                                        label={t(field_labels[criteria])}
                                    />
                                    {
                                        // Object.keys as I need the following order : UP / DOWN
                                        Object
                                            .keys(sort_button_conditions)
                                            .map(
                                                sort_key => {
                                                    const condition_check = sort_button_conditions[sort_key];
                                                    if (!condition_check(index)) {
                                                        return null;
                                                    } else {
                                                        return (
                                                            <IconButton 
                                                                aria-label={sort_key} 
                                                                name={criteria} 
                                                                size="small" 
                                                                onClick={handleSortOrderChange}
                                                                key={criteria + "_"+ sort_key}
                                                            >
                                                                {
                                                                    (() => {
                                                                        switch(sort_key){
                                                                            case "upSorter":
                                                                                return <ArrowUpwardIcon fontSize="inherit" />
                                                                            case "downSorter":
                                                                                return <ArrowDownwardIcon fontSize="inherit" />
                                                                            default:
                                                                                return null;
                                                                        }
                                                                    })()
                                                                } 
                                                            </IconButton> 
                                                        )
                                                    }
                                                }
                                            )
                                    }
                                </div>
                            )
                    }
                </FormGroup>
            </FormControl>
        </Popover>
    </>;
}

// mapStateToProps(state, ownProps)
const mapStateToProps = state => ({
    state: state.games.sorters,
});

const mapDispatchToProps = {
    sort_games,
    change_sorting_order
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamesSorters);