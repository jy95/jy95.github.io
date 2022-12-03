import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    PolarAngleAxis, 
    PolarGrid, 
    Radar, 
    RadarChart, 
    ResponsiveContainer,
    Legend
} from 'recharts';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

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

    // StackedAreaChart : https://recharts.org/en-US/examples/StackedAreaChart
    // StackedBarChart : https://recharts.org/en-US/examples/StackedBarChart

    // for platform chart
    const platformsData = stats.platforms;

    // for generals line
    const generalStats = stats.general;

    const strokeColor = (currentColor === "dark") ? "white": "dark";    

    // TODO
    return (
        <ReloadWrapper  
            loading={loading}
            error={error}
            reloadFct={() => {dispatch(fetchStats());}}
            component={
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12} lg={12}>
                        <Paper
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>{t("stats.generalStats.title")}</Typography>
                            <List>
                                <ListItem>{`${t("stats.generalStats.total_games")} : ${generalStats.total} ${t("stats.generalStats.total_games_details", {available : generalStats.total_available, not_available: generalStats.total_unavailable})}` }</ListItem>
                            </List>
                        </Paper>
                    </Grid>
                    {
                        genresData.length > 0 &&
                        <Grid item xs={12} md={8} lg={8}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 360,
                                }}
                            >
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>{t("stats.genresChart.title")}</Typography>
                                <ResponsiveContainer>
                                    <BarChart data={genresData}>
                                        <CartesianGrid strokeDasharray="2 2" />
                                        <XAxis dataKey="category" stroke={strokeColor} />
                                        <YAxis stroke={strokeColor}  />
                                        <Tooltip contentStyle={{backgroundColor: currentColor}} />
                                        <Bar type="monotone" dataKey="total_available" stackId="1" stroke="#82ca9d" fill="#82ca9d" name={t("stats.genresChart.total_available")} />
                                        <Bar type="monotone" dataKey="total_unavailable" stackId="1" stroke="#8884d8" fill="#8884d8" name={t("stats.genresChart.total_unavailable")} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    }
                    { 
                        platformsData.length > 0 &&
                        <Grid item xs={12} md={4} lg={4}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: 360,
                                }}
                            >
                                <Typography component="h2" variant="h6" color="primary" gutterBottom>{t("stats.platformsChart.title")}</Typography>
                                <ResponsiveContainer>
                                    <RadarChart outerRadius={90} data={platformsData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="key" stroke={strokeColor} />
                                        <Radar name={t("stats.platformsChart.total_available")} dataKey="total_available" stroke="#1fa134" fill="#1fa134" fillOpacity={0.6} />
                                        <Radar name={t("stats.platformsChart.total_unavailable")} dataKey="total_unavailable" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    }
                </Grid>
            }
        />
    );

};

export default StatsPage;