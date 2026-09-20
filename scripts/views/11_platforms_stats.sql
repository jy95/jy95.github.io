SELECT 
    p.id AS id,
    p.name AS platform,
    COUNT(gg.id) AS total,
    COUNT(gp.id) AS total_available,
    COUNT(DISTINCT CASE WHEN gf.id IS NOT NULL AND gp.id IS NULL THEN gf.id END) AS total_unavailable
FROM 
    platforms p
LEFT JOIN
    games gg ON gg.platform = p.id AND gg.id NOT IN (SELECT dlc FROM games_dlcs)
LEFT JOIN 
    games_in_present gp ON gp.id = gg.id
LEFT JOIN 
    games_in_future gf ON gf.id = gg.id AND gf.id NOT IN (SELECT id FROM games_in_present)
GROUP BY 
    p.id
ORDER BY
    total DESC,
    total_available DESC,
    total_unavailable DESC