import { useState, Suspense, lazy } from "react";
import { useSelector, useDispatch } from 'react-redux';
import {useTranslation} from "react-i18next";

import Button from '@mui/material/Button';

import {
    sortingGames,
    sortingOrderChange
} 
// @ts-ignore
from "../../services/gamesSlice.tsx";
// @ts-ignore
import { RootState, AppDispatch } from '../Store.tsx';

// For sorting criteria reorder
// Not used as it produces a bug
//import ButtonGroup from '@mui/material/ButtonGroup';
//import Switch from '@mui/material/Switch';

// Lazy
const FormControl = lazy(() => import("@mui/material/FormControl"));
const FormGroup = lazy(() => import("@mui/material/FormGroup"));
const Popover = lazy(() => import("@mui/material/Popover"));
const Checkbox = lazy(() => import("@mui/material/Checkbox"));
const FormControlLabel = lazy(() => import("@mui/material/FormControlLabel"));
const IconButton = lazy(() => import("@mui/material/IconButton"));

// To display ASC / DESC
const ArrowDropUpIcon = lazy(() => import("@mui/icons-material/ArrowDropUp"));
const ArrowDropDownIcon = lazy(() => import("@mui/icons-material/ArrowDropDown"));

// To move sort
const ArrowUpwardIcon = lazy(() => import("@mui/icons-material/ArrowUpward"));
const ArrowDownwardIcon = lazy(() => import("@mui/icons-material/ArrowDownward"));

// Sort buttons of GamesGallery
function GamesSorters(_props) {

    const { t } = useTranslation('common');
    const dispatch: AppDispatch = useDispatch();
    const sortState = useSelector((state: RootState) => state.games.sorters);

    // To handle criteria enabling (or disabling)
    const handleSortChange = (event) => {
        const field = event.target.name;
        const newSortersState : [
            "name" | "releaseDate" | "duration",
            "ASC" | "DESC"
        ][] = sortState
            .map( ([key, currentOrder]) => {
                if (key === field) {
                    return [key, (currentOrder === "ASC") ? "DESC" : "ASC"]
                } else {
                    return [key, currentOrder];
                }
            });
        dispatch(sortingGames(newSortersState));
    }

    // To handle sort criteria 
    const handleSortOrderChange = (event) => {
        // Warning : using IconButton, event.target doesn't work as expected
        const metadata = event.currentTarget;
        // fetch info
        const field = metadata.name;
        const type_of_sort_change = metadata.getAttribute("aria-label");
        const currentPosition = sortState.findIndex( (entry) => entry[0] === field);
        const nextPosition = currentPosition + ((type_of_sort_change === "upSorter") ? -1 : 1);

        // compute new order
        let newOrder = [...sortState];
        newOrder.splice(nextPosition,2,newOrder[currentPosition],newOrder[nextPosition]);

        dispatch(sortingOrderChange(newOrder));
    }

    // For Popover
    const [anchorEl, setAnchorEl] = useState(null);

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
        "downSorter": (index) => index !== sortState.length -1,
    }

    // TODO one day, delete Popover for something more user friendly (and lighter)
    return <>
        <Button aria-describedby={id} variant="contained" onClick={handleClick}>
            {t("gamesLibrary.sortButtonLabel")}
        </Button>
        <Suspense fallback={null}>
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
                            sortState
                                .map( ([criteria, currentOrder], index) => 
                                    <div
                                        key={"searchCriteria_"+criteria}
                                    >
                                        <FormControlLabel
                                            control={
                                                <>
                                                    <Checkbox 
                                                        checked={currentOrder !== "ASC"}
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
        </Suspense>
    </>;
}

export default GamesSorters;