SELECT game, JSON_GROUP_ARRAY(genre) as 'genres'
FROM games_genres
GROUP BY game