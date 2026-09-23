SELECT
    p.id AS id,
    p.name AS platform,

    COUNT(g.id) AS total,

    COUNT(gp.id) AS total_available,

    COUNT(
        DISTINCT CASE
            WHEN gf.id IS NOT NULL
             AND gp.id IS NULL
            THEN gf.id
        END
    ) AS total_unavailable

FROM platforms AS p

LEFT JOIN games_full AS g
    ON g.platform = p.id

LEFT JOIN games_in_present AS gp
    ON gp.id = g.id

LEFT JOIN games_in_future AS gf
    ON gf.id = g.id

GROUP BY p.id

ORDER BY
    total DESC,
    total_available DESC,
    total_unavailable DESC;