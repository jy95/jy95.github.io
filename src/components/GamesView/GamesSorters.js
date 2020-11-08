import React from "react";

import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Popover from '@material-ui/core/Popover';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Box from "@material-ui/core/Box";

// For sorting criteria reorder
// Not used as it produces a bug
//import ButtonGroup from '@material-ui/core/ButtonGroup';

// To display ASC / DESC
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

// To move sort
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

import {connect} from 'react-redux';
import {sort_games, change_sorting_order} from "../../actions/games";


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

    // For Popover
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    // label
    const field_labels = {
        "name": "Par nom",
        "releaseDate": "Par date de sortie"
    }

    return (
        <Box
            display="flex"
            flexWrap="wrap"
            flexDirection="row"
            justifyContent="flex-end"
        >
            <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>
                Tris
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
                <FormControl component="fieldset">
                    <FormGroup>
                        {
                            sorters
                                .keys
                                .map( (criteria, index) => 
                                    <FormControlLabel
                                        control={
                                            <>
                                                <Switch 
                                                    checked={
                                                        sorters.state[criteria] !== "ASC"
                                                    } 
                                                    onChange={handleSortChange} 
                                                    name={criteria} 
                                                />
                                                {
                                                    sorters.state[criteria] === "ASC" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />
                                                }
                                            </>
                                        }
                                        key={"searchCriteria_"+criteria}
                                        label={
                                            (
                                                <>
                                                    {field_labels[criteria]}
                                                    {
                                                        index !== 0 && 
                                                        <IconButton aria-label="upSorter" name={criteria} onClick={handleSortOrderChange}>
                                                            <ArrowUpwardIcon />
                                                        </IconButton>
                                                    }
                                                    {
                                                        index !== sorters.keys.length -1 && 
                                                        <IconButton aria-label="downSorter" name={criteria} onClick={handleSortOrderChange}>
                                                            <ArrowDownwardIcon />
                                                        </IconButton>
                                                    }
                                                </>
                                            )
                                        }
                                    />
                                )
                        }
                    </FormGroup>
                </FormControl>
            </Popover>
        </Box>
    )
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