import type { CompanySummary as BaseCompanySummary } from "@/domain/companies/types";
import { buildCardEntry } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import type { RawGame, CardGame } from "@/domain/games";

export type CompanyRole = "all" | "developer" | "publisher";
export type CompanyGame = CardGame & { tierCategory?: string | null };
export type CompanySummary = BaseCompanySummary & {
    imagePath: string;
    developerCount: number;
    publisherCount: number;
    gamesCount: number;
};
export type CompanyType = Pick<CompanySummary, "id" | "name" | "imagePath"> & {
    developerGames: CompanyGame[];
    publisherGames: CompanyGame[];
};

type RawCompanyGame = RawGame & { id: number; tierCategory?: string | null };
export type RawCompany = BaseCompanySummary & {
    developerItems: RawCompanyGame[];
    publisherItems: RawCompanyGame[];
};

const DEFAULT_TIER = "tier_not_evaluated";

export async function loadCompanies(): Promise<RawCompany[]> {
    return (await import("./companies.json")).default as RawCompany[];
}

export function companyImagePath(id: number): string {
    return `${COVER_PATHS.companies}/${id}/cover.webp`;
}

function toCompanyGame(game: RawCompanyGame): CompanyGame {
    return {
        ...game,
        ...buildCardEntry(game, COVER_PATHS.games),
        tierCategory: game.tierCategory ?? DEFAULT_TIER,
    };
}

export function toCompanyDetail(company: RawCompany): CompanyType {
    return {
        id: company.id,
        name: company.name,
        imagePath: companyImagePath(company.id),
        developerGames: company.developerItems.map(toCompanyGame),
        publisherGames: company.publisherItems.map(toCompanyGame),
    };
}

/** A game credited twice (e.g. as developer and publisher) is counted once. */
const countUniqueGames = (games: { id: number }[]) => new Set(games.map((game) => game.id)).size;

export function toCompanySummary(company: RawCompany, role: CompanyRole): CompanySummary {
    const { developerItems, publisherItems } = company;
    const counts: Record<CompanyRole, number> = {
        developer: countUniqueGames(developerItems),
        publisher: countUniqueGames(publisherItems),
        all: countUniqueGames([...developerItems, ...publisherItems]),
    };

    return {
        id: company.id,
        name: company.name,
        imagePath: companyImagePath(company.id),
        developerCount: counts.developer,
        publisherCount: counts.publisher,
        gamesCount: counts[role],
    };
}
