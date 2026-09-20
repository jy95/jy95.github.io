SELECT
    gc.game,
    JSON_GROUP_ARRAY(gc.name) AS publishers
FROM (
    SELECT
        gc.game,
        c.name
    FROM games_companies AS gc
    INNER JOIN companies AS c ON c.id = gc.company
    WHERE gc.role = 'publisher'
    ORDER BY c.name COLLATE nocase
) AS gc
GROUP BY gc.game
