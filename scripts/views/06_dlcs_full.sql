SELECT
    dlc.*,
    gd.game AS parent_game,

    parent_schedule."availableAt" AS parent_availableAt,
    parent_schedule."endAt" AS parent_endAt,

    dlc_schedule."availableAt" AS dlc_availableAt,
    dlc_schedule."endAt" AS dlc_endAt,

    CASE
        WHEN
            (
                parent_schedule."availableAt" IS NULL
                OR DATE('now') > parent_schedule."availableAt"
            )
            AND
            (
                dlc_schedule."availableAt" IS NULL
                OR DATE('now') > dlc_schedule."availableAt"
            )
        THEN 'present'

        ELSE 'future'
    END AS availability_status

FROM games AS dlc

INNER JOIN games_dlcs AS gd
    ON gd.dlc = dlc.id

LEFT JOIN games_schedules AS parent_schedule
    ON parent_schedule.id = gd.game

LEFT JOIN games_schedules AS dlc_schedule
    ON dlc_schedule.id = dlc.id;