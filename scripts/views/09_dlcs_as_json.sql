SELECT
    COALESCE(g."playlistId", g."videoId") AS id,
    g.title AS game_title,

    (
        SELECT
            '[' || GROUP_CONCAT(
                JSON_OBJECT(
                    'id', dlc.id,
                    'title', dlc.title,
                    'videoId', dlc.videoId,
                    'playlistId', dlc.playlistId,
                    'duration', dlc.duration,
                    'platform', dlc.platform
                ) ORDER BY gd."order"
            ) || ']'
        FROM games_dlcs AS gd

        INNER JOIN dlcs_in_present AS dlc
            ON dlc.id = gd.dlc

        WHERE gd.game = g.id
    ) AS dlcs

FROM games_in_present AS g

WHERE EXISTS (
    SELECT 1
    FROM games_dlcs AS gd

    INNER JOIN dlcs_in_present AS dlc
        ON dlc.id = gd.dlc

    WHERE gd.game = g.id
)

ORDER BY g.title;