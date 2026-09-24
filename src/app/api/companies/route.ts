import { NextResponse } from "next/server";
import { buildCardEntry } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import type { RawGame, CardGame } from "@/domain/games";

type rawEntry = {
    id: number,
    name: string,
    developerItems: RawGame[],
    publisherItems: RawGame[],
};
export type RawPayload = rawEntry[];

export type CompanyType = {
    id: number,
    name: string,
    imagePath: string,
    developerGames: CardGame[],
    publisherGames: CardGame[],
};

export async function GET() {
    const data = (await import("./companies.json")).default;

    const companies: CompanyType[] = data.map((company) => ({
        id: company.id,
        name: company.name,
        imagePath: `${COVER_PATHS.companies}/${company.id}/cover.webp`,
        developerGames: toCardGames(company.developerItems as RawGame[]),
        publisherGames: toCardGames(company.publisherItems as RawGame[]),
    }));

    return NextResponse.json(companies, {
        headers: { "Cache-Control": "public, max-age=86400, must-revalidate" },
    });
}

function toCardGames(gamesData: RawGame[]): CardGame[] {
    return gamesData.map((game) => ({ ...game, ...buildCardEntry(game, COVER_PATHS.games) }));
}