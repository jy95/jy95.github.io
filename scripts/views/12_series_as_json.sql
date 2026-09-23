WITH present_content AS (
    SELECT
        id,
        title,
        "videoId",
        "playlistId",
        duration,
        platform
    FROM games_in_present

    UNION ALL

    SELECT
        id,
        title,
        "videoId",
        "playlistId",
        duration,
        platform
    FROM dlcs_in_present
)
SELECT
    s.id,
    s.name,

    (
        SELECT
            '[' || GROUP_CONCAT(
                JSON_OBJECT(
                    'id', content.id,
                    'title', content.title,
                    'videoId', content."videoId",
                    'playlistId', content."playlistId",
                    'duration', content.duration,
                    'platform', content.platform
                ) ORDER BY sg."order"
            ) || ']'
        FROM series_games AS sg

        INNER JOIN present_content AS content
            ON content.id = sg.game

        WHERE sg.serie = s.id
    ) AS items

FROM series AS s

WHERE EXISTS (
    SELECT 1
    FROM series_games AS sg

    INNER JOIN present_content AS content
        ON content.id = sg.game

    WHERE sg.serie = s.id
)

ORDER BY s.name;