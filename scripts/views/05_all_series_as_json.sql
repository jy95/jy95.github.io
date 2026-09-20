SELECT
    s.name,
    '[' || GROUP_CONCAT(
        JSON_OBJECT(
            'id', g.id,
            'title', g.title,
            'videoId', g."videoId",
            'playlistId', g."playlistId",
            'duration', g.duration,
            'platform', g.platform
        )
    ) || ']' AS items
FROM series_games AS sg
INNER JOIN games AS g ON g.id = sg.game
INNER JOIN series AS s ON s.id = sg.serie
GROUP BY s.id