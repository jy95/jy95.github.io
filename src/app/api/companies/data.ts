import { buildCardEntry } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import type { RawGame, CardGame } from "@/domain/games";

export type CompanyRole = "all" | "developer" | "publisher";
export type CompanyGame = CardGame & { tierCategory?: string | null };
export type CompanySummary = {
    id: number;
    name: string;
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
export type RawCompany = {
    id: number;
    name: string;
    developerItems: RawCompanyGame[];
    publisherItems: RawCompanyGame[];
};

export async function loadCompanies(): Promise<RawCompany[]> {
    return (await import("./companies.json")).default as RawCompany[];
}

export function companyImagePath(id: number): string {
    return `${COVER_PATHS.companies}/${id}/cover.webp`;
}

export async function toCompanyDetail(company: RawCompany): Promise<CompanyType> {
    const toGames = (games: RawCompanyGame[]): CompanyGame[] =>
        games.map((game) => ({
            ...game,
            ...buildCardEntry(game, COVER_PATHS.games),
            tierCategory: game.tierCategory ?? "tier_not_evaluated",
        }));

    return {
        id: company.id,
        name: company.name,
        imagePath: companyImagePath(company.id),
        developerGames: toGames(company.developerItems),
        publisherGames: toGames(company.publisherItems),
    };
}

export function toCompanySummary(company: RawCompany, role: CompanyRole): CompanySummary {
    const developerCount = new Set(company.developerItems.map((game) => game.id)).size;
    const publisherCount = new Set(company.publisherItems.map((game) => game.id)).size;
    const gamesCount = role === "developer" ? developerCount : role === "publisher" ? publisherCount :
        new Set([...company.developerItems, ...company.publisherItems].map((game) => game.id)).size;
    return { id: company.id, name: company.name, imagePath: companyImagePath(company.id), developerCount, publisherCount, gamesCount };
}
