SELECT *
FROM dlcs_full
WHERE availability_status = 'future'
ORDER BY
    dlc_availableAt ASC,
    title ASC;