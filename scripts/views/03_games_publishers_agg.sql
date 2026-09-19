SELECT 
    gc.game,
    JSON_GROUP_ARRAY(gc.company) AS publishers
FROM (
    SELECT gc.game, gc.company
    FROM games_companies gc
    JOIN companies c ON c.id = gc.company
    WHERE gc.role = 'publisher'
    ORDER BY c.name COLLATE NOCASE
) gc
GROUP BY gc.game