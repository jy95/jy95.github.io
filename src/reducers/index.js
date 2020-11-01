import { combineReducers } from "redux"

import games from "./games";
import planning from "./planning"

const rootReducer = combineReducers({
    games,
    planning
});

export default rootReducer;