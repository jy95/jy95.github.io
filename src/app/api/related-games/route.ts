import { staticJsonRoute } from "@/lib/http/staticJsonRoute";
import type { RelatedGamesMap } from "@/domain/discovery/relatedGames";

export const GET = staticJsonRoute<RelatedGamesMap>(() => import("./related-games.json"));