import { useEffect } from "react";

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";

import { fetchStats, selectStats } from "../../services/statsSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/typedRedux";

// The gallery component
function StatsPage(_props : {[key: string | number | symbol] : any}) {

    const dispatch = useAppDispatch();
    const {
        loading,
        error,
        stats
    } = useAppSelector((state) => selectStats(state));

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchStats());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    console.log(stats);

    // TODO
    return (
        <ReloadWrapper  
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchStats());}}
            component={
                <div />
            }
        />
    );

};

export default StatsPage;