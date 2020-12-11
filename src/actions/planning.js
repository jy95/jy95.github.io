import gamesData from "../data/scheduledGames.json";

export const FETCHING_REQUESTED = "PLANNING_REQUESTED";
export const FETCHING_OK = "PLANNING_FETCHING_OK";

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
                    let releaseDate = scheduledGame["releaseDate"];
                    const parts = releaseDate.split("/");
                    return Object.assign(
                        {}, 
                        scheduledGame, 
                        { "releaseDate": new Date(+parts[2], parts[1] -1, +parts[0]) }
                    );
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