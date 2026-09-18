import type { CardGame } from "@/domain/games";
import type { TierCategoryKey as RelatedGameTier } from "@/types/tierList";

export interface RelatedGameResult {
    game: CardGame;
    score: number;
}

export type SeriesGame = {
    id: string;
    order: number;
};

export type RelatedGamesWeights = {
    series: number;
    adjacentSeries: number;
    title: number;
    /** Applied when a candidate contains the full set of target genres. */
    genres: number;
    /** Applied once per unique target genre after a full genre-set match. */
    genre: number;
    platform: number;
    duration: number;
    tier: Record<RelatedGameTier, number>;
};

export interface RelatedGamesOptions {
    /** Maps card IDs to a series ID and an ordered position in that series. */
    seriesMap?: Record<string, SeriesGame>;
    /** Maps candidate game ids to their tier-list category. */
    tierMap?: Record<string, RelatedGameTier>;
    weights?: Partial<Omit<RelatedGamesWeights, "tier">> & {
        tier?: Partial<Record<RelatedGameTier, number>>;
    };
    /** Max number of results to return. `@default` 3 */
    limit?: number;
}

export type RelatedGameEntry = Pick<CardGame, "id" | "title" | "imagePath" | "url" | "url_type">;

export type RelatedGamesMap = Record<string, RelatedGameEntry[]>;
