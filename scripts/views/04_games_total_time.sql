SELECT
    SUM(hours) AS hours,
    SUM(minutes) + (SUM(seconds) / 60) AS minutes,
    SUM(seconds) % 60 AS seconds
FROM (
    SELECT
        CAST(SUBSTR(duration, 1, 2) AS INTEGER) AS hours,
        CAST(SUBSTR(duration, 4, 2) AS INTEGER) AS minutes,
        CAST(SUBSTR(duration, 7, 2) AS INTEGER) AS seconds
    FROM games
) AS g