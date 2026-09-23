SELECT
    c.id,
    c.name,
    gc.role,
    COUNT(*) AS total
FROM games_companies AS gc
JOIN companies AS c ON c.id = gc.company
JOIN games_in_present AS gp ON gp.id = gc.game
GROUP BY c.id, gc.role
ORDER BY total DESC, c.name COLLATE NOCASE;
