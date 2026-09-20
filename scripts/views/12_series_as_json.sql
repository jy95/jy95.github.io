SELECT 
    s.id,
    s.name,
    (
        SELECT 
            '[' || GROUP_CONCAT(
                JSON_OBJECT(
                    'id', g.id,
                    'title', g.title,
                    'videoId', g.videoId,
                    'playlistId', g.playlistId,
                    'duration', g.duration,
                    'platform', g.platform
                ) ORDER BY sg."order"
            ) || ']' 
        FROM series_games sg
        INNER JOIN games_in_present g ON g.id = sg.game
        WHERE sg.serie = s.id
    ) AS items
FROM series s
WHERE EXISTS (
    SELECT 1
    FROM series_games sg
    INNER JOIN games_in_present g ON g.id = sg.game
    WHERE sg.serie = s.id
) 
ORDER BY s.name