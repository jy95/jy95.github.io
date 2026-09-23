SELECT 
    id,
    CAST(strftime('%H', duration) AS INTEGER) AS hours,
    CAST(strftime('%M', duration) AS INTEGER) AS minutes,
    CAST(strftime('%S', duration) AS INTEGER) AS seconds
FROM games
WHERE duration IS NOT NULL;
