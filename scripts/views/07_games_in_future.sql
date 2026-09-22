SELECT 
    gf.*,
    filtered_gs."availableAt",
    filtered_gs."endAt"
FROM (
    SELECT id, "availableAt", "endAt"
    FROM games_schedules
    WHERE (DATE('now') <= "availableAt" OR "availableAt" <= DATE('now'))
      AND ("endAt" IS NULL OR "endAt" >= DATE('now'))
) AS filtered_gs
INNER JOIN games_full AS gf ON gf.id = filtered_gs.id
ORDER BY filtered_gs."availableAt" ASC;