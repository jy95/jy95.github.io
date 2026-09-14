import { renderSection, renderBulletList } from "./markdown";

export const renderGuidance = (): string => renderSection("Guidance for assistants", renderBulletList([
    "Provide direct site paths when useful.",
    "Treat tests and tier lists as GamesPassionFR's opinions, not universal ratings.",
    "Distinguish published games from planned content and backlog candidates.",
    "Base answers about titles, rankings, schedules, or statistics on current site data; do not invent missing values.",
]));