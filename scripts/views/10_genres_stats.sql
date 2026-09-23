WITH available_content AS (
    SELECT id
    FROM games_in_present

    UNION ALL

    SELECT id
    FROM dlcs_in_present
),
future_content AS (
    SELECT id
    FROM games_in_future

    UNION ALL

    SELECT id
    FROM dlcs_in_future
)

SELECT
    g.id AS id,
    g.name AS genre,
    COUNT(gg.game) AS total,
    COUNT(ac.id) AS total_available,
    COUNT(
        DISTINCT CASE
            WHEN fc.id IS NOT NULL
             AND ac.id IS NULL
            THEN fc.id
        END
    ) AS total_unavailable

FROM genres AS g

LEFT JOIN games_genres AS gg
    ON g.id = gg.genre

LEFT JOIN available_content AS ac
    ON ac.id = gg.game

LEFT JOIN future_content AS fc
    ON fc.id = gg.game

GROUP BY g.id

ORDER BY
    total DESC,
    total_available DESC,
    total_unavailable DESC;