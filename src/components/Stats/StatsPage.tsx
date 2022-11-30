import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

// Custom
import ReloadWrapper from "../Others/ReloadWrapper";

import { fetchStats, selectStats } from "../../services/statsSlice";
// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/typedRedux";

// types
import type { Genre as GenreValue } from "../../services/sharedDefintion";

// The gallery component
function StatsPage(_props : {[key: string | number | symbol] : any}) {

    const { t } = useTranslation('common');
    const dispatch = useAppDispatch();
    const {
        loading,
        error,
        stats
    } = useAppSelector((state) => selectStats(state));
    const currentColor = useAppSelector( (state) => state.themeColor.currentColor )

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

    // for platform chart
    const platformsData = stats.platforms;

    // StackedAreaChart : https://recharts.org/en-US/examples/StackedAreaChart
    // StackedBarChart : https://recharts.org/en-US/examples/StackedBarChart

    const strokeColor = (currentColor === "dark") ? "white": "dark";    

    // TODO
    return (
        <ReloadWrapper  
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchStats());}}
            component={
                <>
                {
                    genresData.length > 0 &&
                    <BarChart width={500} height={250} data={genresData}>
                        <CartesianGrid strokeDasharray="2 2" />
                        <XAxis dataKey="category" stroke={strokeColor} />
                        <YAxis stroke={strokeColor}  />
                        <Tooltip contentStyle={{backgroundColor: currentColor}} />
                        <Bar type="monotone" dataKey="total_available" stackId="1" stroke="#82ca9d" fill="#82ca9d" name={t("stats.genresChart.total_available")} />
                        <Bar type="monotone" dataKey="total_unavailable" stackId="1" stroke="#8884d8" fill="#8884d8" name={t("stats.genresChart.total_unavailable")} />
                    </BarChart>
                }
                { 
                    platformsData.length > 0 &&
                    <RadarChart outerRadius={90} width={300} height={250} data={platformsData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="key" stroke={strokeColor} />
                        <Radar name="Mike" dataKey="total_available" stroke="#1fa134" fill="#1fa134" fillOpacity={0.6} />
                        <Radar name="Mike" dataKey="total_unavailable" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                }
                </>
            }
        />
    );

};

export default StatsPage;