SELECT
    gc.game,
    JSON_GROUP_ARRAY(JSON_OBJECT('id', gc.id, 'name', gc.name)) AS publishers
FROM (
    SELECT
        gc.game,
        c.id,
        c.name
    FROM games_companies AS gc
    INNER JOIN companies AS c ON c.id = gc.company
    WHERE gc.role = 'publisher'
    ORDER BY c.name COLLATE nocase
) AS gc
GROUP BY gc.game
