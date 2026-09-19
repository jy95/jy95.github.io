SELECT 
    SUM(hours) AS hours,
    SUM(minutes) + (SUM(seconds) / 60) AS minutes,
    SUM(seconds) % 60 AS seconds
FROM (
    SELECT 
        CAST(substr(duration, 1, 2) AS INTEGER) AS hours,
        CAST(substr(duration, 4, 2) AS INTEGER) AS minutes,
        CAST(substr(duration, 7, 2) AS INTEGER) AS seconds
    FROM games_in_present
)