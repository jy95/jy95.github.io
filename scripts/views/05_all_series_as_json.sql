SELECT 
    s.name, 
    '[' || GROUP_CONCAT(
        JSON_OBJECT(
            'id', g.id,
            'title', g.title,
            'videoId', g.videoId,
            'playlistId', g.playlistId,
            'duration', g.duration,
            'platform', g.platform
        )
    ) || ']' as 'items'
FROM series_games sg
INNER JOIN games g ON g.id = sg.game
INNER JOIN series s ON s.id = sg.serie
GROUP BY s.id