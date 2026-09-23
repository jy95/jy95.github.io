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
    publishers
FROM games_full
WHERE availability_status IN (
    'unscheduled',
    'present',
    'past'
)
ORDER BY
    title ASC,
    "releaseDate" ASC,
    duration ASC;