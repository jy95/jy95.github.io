SELECT *
FROM games_schedules
WHERE ( DATE('now') <= availableAt OR availableAt <= DATE('now')) AND (endAt IS NULL OR DATE('now') <= endAt)
ORDER BY availableAt ASC