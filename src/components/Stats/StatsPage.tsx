import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";

import { fetchStats, selectStats } from "../../services/statsSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/typedRedux";

// types
import type { Genre as GenreValue } from "../../services/sharedDefintion";

// The gallery component
function StatsPage(_props : {[key: string | number | symbol] : any}) {

    const dispatch = useAppDispatch();
    const {
        loading,
        error,
        stats
    } = useAppSelector((state) => selectStats(state));
    const { t } = useTranslation('common');

    // on mount, load data (only once)
    useEffect(() => {
        dispatch(fetchStats());
    }, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // for genre chart
    const genresData = stats.genres.map(s => ({
        ...s,
        category: t(`gamesLibrary.gamesGenres.${s.key as GenreValue}` as const)
    }));

    // TODO
    return (
        <ReloadWrapper  
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchStats());}}
            component={
                <RadarChart outerRadius={90} width={500} height={500} data={genresData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} />
                    <Radar name="Mike" dataKey="total_available" stroke="#1fa134" fill="#1fa134" fillOpacity={0.6} />
                    <Radar name="Mike" dataKey="total_unavailable" stroke="#8faaba" fill="#8faaba" fillOpacity={0.6} />
                </RadarChart>
            }
        />
    );

};

export default StatsPage;