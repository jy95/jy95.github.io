SELECT
    id,
    title,
    "videoId",
    "playlistId",
    "releaseDate",
    duration,
    platform,
    genres,
    developers,
    publishers,
    "availableAt",
    "endAt"
FROM games_full
WHERE availability_status IN (
    'present',
    'future'
)
ORDER BY
    "availableAt" ASC;