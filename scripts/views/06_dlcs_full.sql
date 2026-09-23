SELECT
    dlc.*,

    gd.game AS parent_game,

    parent."availableAt" AS parent_availableAt,
    parent."endAt" AS parent_endAt,
    parent.availability_status AS parent_availability_status,

    dlc_schedule."availableAt" AS availableAt,
    dlc_schedule."endAt" AS endAt,

    CASE
        WHEN dlc_schedule.id IS NULL THEN 'unscheduled'
        WHEN DATE('now') <= dlc_schedule."availableAt" THEN 'future'
        WHEN dlc_schedule."endAt" IS NOT NULL
             AND DATE('now') > dlc_schedule."endAt" THEN 'past'
        ELSE 'present'
    END AS availability_status

FROM games AS dlc

INNER JOIN games_dlcs AS gd
    ON gd.dlc = dlc.id

LEFT JOIN games_full AS parent
    ON parent.id = gd.game

LEFT JOIN games_schedules AS dlc_schedule
    ON dlc_schedule.id = dlc.id;