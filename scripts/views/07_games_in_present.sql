SELECT *
FROM games_full
WHERE id NOT IN (
    SELECT gs.id
    FROM games_schedules AS gs
    WHERE DATE('now') <= gs."availableAt"
)
ORDER BY title ASC, "releaseDate" ASC, duration ASC