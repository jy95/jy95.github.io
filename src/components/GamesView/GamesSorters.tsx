import { useState, Suspense, lazy } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from "react-i18next";
// To check what should happen when clicking on a game
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Button from '@mui/material/Button';

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
const NativeSelect = lazy(() => import("@mui/material/NativeSelect"));
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
    const isNative = useMediaQuery(theme.breakpoints.down('md'));
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

    const CustomSelect = ({criteria, index}) => {
        // shared props
        const props = {
            value: newSortState[index][0],
            id: "searchCriteria_" + index,
            label: t("gamesLibrary.sortForm.criteria"),
            onChange: (event) => handleInputChange({
                    index, 
                    field: event.target.value.toString() as "name" | "releaseDate" | "duration", 
                    type: "changeFieldOrder"
            })
        }

        if (isNative){
            return <FormControl>
                <InputLabel htmlFor={"searchCriteria_" + index}>
                    {t("gamesLibrary.sortForm.criteria")}
                </InputLabel>
                <NativeSelect
                    {...props}
                >
                    {
                        Object
                            .entries(field_labels)
                            .map( ([field, translationKey]) => 
                                <option value={field} key={field}>
                                    {t(translationKey)}
                                </option>
                            )
                    }
                </NativeSelect>
            </FormControl>
        } else {
            return <FormControl>
                <InputLabel id={"searchCriteriaLabel_" + index}>
                    {t("gamesLibrary.sortForm.criteria")}
                </InputLabel>
                <Select
                    {...props}
                    labelId={"searchCriteriaLabel_" + index}
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
        }
    }

    return <>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
            {t("gamesLibrary.sortButtonLabel")}
        </Button>
        <Suspense fallback={null}>
            <Dialog
                //fullWidth
                fullScreen={isNative}
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
                                <CustomSelect 
                                    criteria={criteria}
                                    index={index}
                                    key={index}
                                />
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