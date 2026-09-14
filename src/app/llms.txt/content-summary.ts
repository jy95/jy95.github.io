import backlog from "@/app/api/backlog/backlog.json";
import games from "@/app/api/games/games.json";
import planning from "@/app/api/planning/planning.json";
import tests from "@/app/api/tests/tests.json";
import backlogTiers from "@/app/api/tier-lists/backlog/backlog.json";
import gameTiers from "@/app/api/tier-lists/games/games.json";
import testTiers from "@/app/api/tier-lists/tests/tests.json";

type TierList = Record<string, readonly unknown[]>;

export interface CatalogData {
    games: readonly unknown[];
    tests: readonly unknown[];
    backlog: readonly unknown[];
    planning: readonly unknown[];
    gameTiers: TierList;
    backlogTiers: TierList;
    testTiers: TierList;
}

const catalogData: CatalogData = {
    games,
    tests,
    backlog,
    planning,
    gameTiers,
    backlogTiers,
    testTiers,
};

const tierTotal = (tiers: TierList) => Object.values(tiers)
    .reduce((total, entries) => total + entries.length, 0);

export function buildContentSummary(data: CatalogData = catalogData) {
    return `## Current catalog

- Published games: ${data.games.length}
- Tests: ${data.tests.length}
- Backlog candidates: ${data.backlog.length}
- Planned items: ${data.planning.length}
- Ranked games: ${tierTotal(data.gameTiers)}
- Ranked backlog entries: ${tierTotal(data.backlogTiers)}
- Ranked tests: ${tierTotal(data.testTiers)}`;
}
