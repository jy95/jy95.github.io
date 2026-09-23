SELECT *
FROM dlcs_full
WHERE availability_status IN (
    'unscheduled',
    'present',
    'past'
)
AND parent_availability_status IN (
    'unscheduled',
    'present',
    'past'
)
ORDER BY
    title ASC,
    "releaseDate" ASC,
    duration ASC;