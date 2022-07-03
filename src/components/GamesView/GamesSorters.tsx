import { useState, Suspense, lazy } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from "react-i18next";
// To check what should happen when clicking on a game
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Button from '@mui/material/Button';
import type { SelectChangeEvent } from '@mui/material/Select';

// @ts-ignore
import { sortingGames } from "../../services/gamesSlice.tsx";
// @ts-ignore
import type { RootState, AppDispatch } from '../Store.tsx';

// For sorting criteria reorder
// Not used as it produces a bug
//import ButtonGroup from '@mui/material/ButtonGroup';
//import Switch from '@mui/material/Switch';

// Lazy
const Checkbox = lazy(() => import("@mui/material/Checkbox"));
const Select = lazy(() => import("@mui/material/Select"));
const MenuItem = lazy(() => import("@mui/material/MenuItem"));
const InputLabel = lazy(() => import("@mui/material/InputLabel"));
const FormControl = lazy(() => import("@mui/material/FormControl"));

const List = lazy(() => import("@mui/material/List"));
const ListItem = lazy(() => import("@mui/material/ListItem"));
const ListItemText = lazy(() => import("@mui/material/ListItemText"));

const Dialog = lazy(() => import("@mui/material/Dialog"));
const DialogTitle = lazy(() => import("@mui/material/DialogTitle"));
const DialogContent = lazy(() => import("@mui/material/DialogContent"));
const DialogActions = lazy(() => import("@mui/material/DialogActions"));

// To display ASC / DESC
const ArrowDropUpIcon = lazy(() => import("@mui/icons-material/ArrowDropUp"));
const ArrowDropDownIcon = lazy(() => import("@mui/icons-material/ArrowDropDown"));

// Sort buttons of GamesGallery
function GamesSorters(_props) {

    // hooks
    const { t } = useTranslation('common');
    const dispatch: AppDispatch = useDispatch();
    const theme = useTheme();

    // state
    const [ isDialogOpen, setDialogOpen ] = useState(false);
    const sortState = useSelector((state: RootState) => state.games.sorters);
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    let [ newSortState, setNewSortState ] = useState([...sortState]);

    // map field to labels in translation file(s)
    const field_labels = {
        "name": "gamesLibrary.sortLabels.name",
        "releaseDate": "gamesLibrary.sortLabels.releaseDate",
        "duration": "gamesLibrary.sortLabels.duration"
    }

    // handle input change
    const handleInputChange = (
        params : {
            index: number,
            type: 'criteriaOrder' | 'changeFieldOrder'
            field: 'name' | 'releaseDate' | 'duration'
        }
    ) => {
        const index = params.index;
        const modifiedState = [...newSortState];

        switch (params.type) {
            case "criteriaOrder":
                const nextState = (modifiedState[index][1] === "ASC") ? "DESC" : "ASC";
                modifiedState[index] = [ modifiedState[index][0], nextState]
                setNewSortState(modifiedState);
                break;

            case "changeFieldOrder":
                modifiedState[index] = [params.field, modifiedState[index][1]];
                setNewSortState(modifiedState);
                break;
        
            default:
                break;
        }
    }

    return <>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
            {t("gamesLibrary.sortButtonLabel")}
        </Button>
        <Suspense fallback={null}>
            <Dialog
                //fullWidth
                fullScreen={fullScreen}
                open={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="games-sorters-dialog"
            >
                <DialogTitle id="games-sorters-dialog">
                    {t("gamesLibrary.sortForm.title")}
                </DialogTitle>
                <DialogContent>
                    <List>
                        {
                            newSortState.map( ([criteria, _], index) => <ListItem key={index}>
                                <ListItemText primary={ t((index === 0) ? "gamesLibrary.sortForm.firstSort" : "gamesLibrary.sortForm.nextSort" ) }/>
                                <FormControl>
                                    <InputLabel id={"searchCriteriaLabel_" + index}>{t("gamesLibrary.sortForm.criteria")}</InputLabel>
                                    <Select
                                        id={"searchCriteria_" + index}
                                        labelId={"searchCriteriaLabel_" + index}
                                        label={t("gamesLibrary.sortForm.criteria")}
                                        native={fullScreen}
                                        value={newSortState[index][0]}
                                        // @ts-ignore Typings are not considering `native`
                                        onChange={
                                            (event : SelectChangeEvent<HTMLSelectElement>) => 
                                                handleInputChange({
                                                    index, 
                                                    field: event.target.value.toString() as "name" | "releaseDate" | "duration", 
                                                    type: "changeFieldOrder"
                                                })
                                        }
                                    >
                                        {
                                            Object
                                                .entries(field_labels)
                                                .map( ([field, translationKey]) => 
                                                    <MenuItem value={field} key={field}>
                                                        {t(translationKey)}
                                                    </MenuItem>
                                                )
                                        }
                                    </Select>
                                </FormControl>
                                <Checkbox
                                    edge={'end'}
                                    checked={newSortState[index][1] !== "ASC"}
                                    onChange={
                                        () => 
                                        handleInputChange({
                                            index, 
                                            field: criteria, 
                                            type: "criteriaOrder"
                                        })
                                    }
                                    checkedIcon={<ArrowDropUpIcon />}
                                    icon={<ArrowDropDownIcon />} 
                                />
                            </ListItem>)
                        }
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => {
                        // restore previous state
                        setNewSortState(sortState);
                        setDialogOpen(false);
                    }}>
                        {t("gamesLibrary.sortForm.cancelButton")}
                    </Button>
                    {/* TODO replace that */}
                    <Button autoFocus onClick={() => {
                        setDialogOpen(false);
                        dispatch(sortingGames(newSortState));
                    }}>
                        {t("gamesLibrary.sortForm.sortButton")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Suspense>
    </>;
}

export default GamesSorters;