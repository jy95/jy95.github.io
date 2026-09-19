SELECT
    gc.game,
    JSON_GROUP_ARRAY(gc.company) AS developers
FROM (
    SELECT
        gc.game,
        gc.company
    FROM games_companies AS gc
    INNER JOIN companies AS c ON c.id = gc.company
    WHERE gc.role = 'developer'
    ORDER BY c.name COLLATE nocase
) AS gc
GROUP BY gc.game