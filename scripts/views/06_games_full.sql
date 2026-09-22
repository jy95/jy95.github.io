SELECT
    g.id,
    g.title,
    g."videoId",
    g."playlistId",
    g."releaseDate",
    g.duration,
    g.platform,
    COALESCE(genres_agg.genres, JSON('[]')) AS genres,
    COALESCE(devs_agg.developers, JSON('[]')) AS developers,
    COALESCE(pubs_agg.publishers, JSON('[]')) AS publishers
FROM games AS g
LEFT JOIN games_genres_agg AS genres_agg ON genres_agg.game = g.id
LEFT JOIN games_developers_agg AS devs_agg ON devs_agg.game = g.id
LEFT JOIN games_publishers_agg AS pubs_agg ON pubs_agg.game = g.id
WHERE g.id NOT IN (SELECT dlc FROM games_dlcs)