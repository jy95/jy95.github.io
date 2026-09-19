SELECT
    SUM(hours) AS hours,
    SUM(minutes) + (SUM(seconds) / 60) AS minutes,
    SUM(seconds) % 60 AS seconds
FROM (
    SELECT
        CAST(substr(g.duration, 1, 2) AS INTEGER) AS hours,
        CAST(substr(g.duration, 4, 2) AS INTEGER) AS minutes,
        CAST(substr(g.duration, 7, 2) AS INTEGER) AS seconds
    FROM games AS g
    WHERE g.id IN (SELECT gif.id FROM games_in_future AS gif)
) AS g_sub