SELECT 
    g.id AS id,
    g.name AS genre,
    COUNT(gg.game) AS total,
    COUNT(gp.id) AS total_available,
    COUNT(DISTINCT CASE WHEN gf.id IS NOT NULL AND gp.id IS NULL THEN gf.id END) AS total_unavailable
FROM 
    genres g
LEFT JOIN 
    games_genres gg ON g.id = gg.genre
LEFT JOIN 
    games_in_present gp ON gg.game = gp.id
LEFT JOIN 
    games_in_future gf ON gg.game = gf.id AND gf.id NOT IN (SELECT id FROM games_in_present)
GROUP BY 
    g.id
ORDER BY
    total DESC,
    total_available DESC,
    total_unavailable DESC