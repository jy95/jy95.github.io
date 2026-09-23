SELECT *
FROM dlcs_full
WHERE availability_status IN (
    'present',
    'future'
)
ORDER BY
    "availableAt" ASC,
    title ASC;