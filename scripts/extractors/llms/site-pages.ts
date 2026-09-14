import { getPathname, routing } from "@/i18n/routing";
import { renderSection, renderBulletList } from "./markdown";

const PAGE_PURPOSES: Readonly<Record<string, string>> = {
    "/": "Browse the catalog homepage and featured gaming content.",
    "/games": "Browse all published games and walkthroughs.",
    "/games/series": "Browse published games grouped by series.",
    "/games/dlcs": "Browse published downloadable-content walkthroughs.",
    "/games/random": "Open a randomly selected published game.",
    "/planning": "See games planned for future publication.",
    "/backlog": "Browse games being considered for future walkthroughs.",
    "/tests": "Browse game tests and reviews.",
    "/stats": "View statistics about the published catalog.",
    "/tier": "Choose a GamesPassionFR tier-list collection.",
    "/tier/games": "View the ranking of published games.",
    "/tier/backlog": "View the ranking of backlog candidates.",
    "/tier/tests": "View the ranking of tested games.",
    "/links": "Find GamesPassionFR's external and social links.",
    "/video/:id": "Watch the YouTube video identified by id.",
    "/playlist/:id": "Watch the YouTube walkthrough playlist identified by id.",
};

export function buildStaticPaths(): string[] {
    return Object.keys(routing.pathnames).map((pathname) => getPathname({
        locale: routing.defaultLocale,
        href: pathname as Parameters<typeof getPathname>[0]["href"],
    }).replace("[id]", ":id"));
}

export const renderSitePages = (paths: readonly string[]): string =>
    renderSection("Site pages", renderBulletList(paths.map((path) => `${path}: ${PAGE_PURPOSES[path]}`)));