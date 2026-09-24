WITH present_content AS (
    SELECT 
        id,
        json_object(
            'id', id,
            'title', title,
            'videoId', "videoId",
            'playlistId', "playlistId",
            'duration', duration,
            'platform', platform
        ) AS json_data
    FROM games_in_present
)
SELECT
    c.id,
    c.name,

    COALESCE((
        SELECT json_group_array(json_extract(content.json_data, '$'))
        FROM games_companies gc
        INNER JOIN present_content content ON content.id = gc.game
        WHERE gc.company = c.id AND gc.role = 'developer'
    ), '[]') AS developerItems,

    COALESCE((
        SELECT json_group_array(json_extract(content.json_data, '$'))
        FROM games_companies gc
        INNER JOIN present_content content ON content.id = gc.game
        WHERE gc.company = c.id AND gc.role = 'publisher'
    ), '[]') AS publisherItems

FROM companies c
WHERE EXISTS (
    SELECT 1 FROM games_companies gc
    INNER JOIN present_content content ON content.id = gc.game
    WHERE gc.company = c.id
)
ORDER BY 
    (json_array_length(developerItems) + json_array_length(publisherItems)) DESC,
    c.name COLLATE NOCASE;