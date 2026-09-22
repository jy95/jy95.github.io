SELECT *
FROM dlcs_full
WHERE availability_status = 'present'
ORDER BY
    title ASC,
    "releaseDate" ASC,
    duration ASC;