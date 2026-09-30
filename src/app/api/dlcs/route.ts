import { NextResponse } from "next/server";
import { loadDlcGroups, toPublishedGame } from "@/lib/gamesData";
import type { StoredDlcGroup } from "@/lib/gamesData";
import type { CardGame } from "@/domain/games";

export type RawPayload = StoredDlcGroup[];

export type dlcType = {
    id: string,
    name: string,
    items: CardGame[]
};

export async function GET() {
    const dlcsData = await loadDlcGroups();

    const dlcs: dlcType[] = dlcsData.map((dlc) => ({
        id: dlc.id,
        name: dlc.game_title,
        items: dlc.dlcs.map(toPublishedGame)
    }));

    return NextResponse.json(dlcs, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}
