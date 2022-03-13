import gamesData from "../data/scheduledGames.json";

export const FETCHING_REQUESTED = "PLANNING_REQUESTED";
export const FETCHING_OK = "PLANNING_FETCHING_OK";
const intergerDateRegex = /(?<year>\d{4,})(?<month>\d{2})(?<day>\d{2})/;

export const get_scheduled_games = () => {
    return (dispatch, getState) => {
        const {
            planning: {
                planning: previousFetchedPlanning
            }
        } = getState();

        if (previousFetchedPlanning.length === 0) {
            
            dispatch(fetchingStarted());

            // current date as integer (quicker comparaison)
            const currentDate = new Date();
            const integerDate = [
                currentDate.getFullYear() * 10000,
                (currentDate.getMonth() + 1) * 100,
                currentDate.getDate()
            ].reduce((acc, cur) => acc + cur, 0);

            // a scheduled game should only be displayed with these specific conditions
            const should_be_displayed = (elem, min, max) => elem <= max || elem <= min;

            const planning = gamesData
                .filter(game => should_be_displayed(integerDate, game.availableAt, game.endAt) )
                .map(scheduledGame => {

                    const releaseDate = scheduledGame?.availableAt.toString();
                    if ( releaseDate.match(intergerDateRegex)) {
                        const { year, month, day } = intergerDateRegex.exec(releaseDate).groups;
                        return {
                            ...scheduledGame,
                            "releaseDate": new Date(+year, month - 1, +day)
                        }
                    } else {
                        return scheduledGame;
                    }
                    
                });
    
            dispatch(fetchingFinished(planning));
        }

    };
};

const fetchingStarted = () => ({
    type: FETCHING_REQUESTED
});

const fetchingFinished = (planning) => ({
    type: FETCHING_OK,
    planning
});