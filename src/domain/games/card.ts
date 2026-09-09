import { extractGameCardProps } from "./youtube";
import type { RawGame, CardEntry, CardGame, BasicGame } from "./types";

const DEFAULT_COVER_FILE = "cover.webp";

/**
 * Builds the CardEntry portion (id/url/url_type/imagePath) shared by every
 * "list of games" data source. `coversBasePath` lets each caller point at
 * its own public folder while keeping id/url derivation and the coverFile
 * fallback in exactly one place.
 */
export function buildCardEntry(game: RawGame, coversBasePath: string): CardEntry & { id: string } {
    const { id, url, url_type } = extractGameCardProps(game);
    return {
        id,
        url,
        url_type,
        imagePath: `${coversBasePath}/${id}/${game.coverFile ?? DEFAULT_COVER_FILE}`
    };
}

/**
 * Canonical transformation from a raw game record into the full CardGame
 * representation. This is the single source of truth for "how a raw game
 * becomes a card". Callers with feature-specific extra fields (e.g.
 * planning's status) should spread this result and add their own fields:
 *
 *   return { ...buildCardGame(game, "/covers"), status };
 */
export function buildCardGame(game: BasicGame, coversBasePath: string): CardGame {
    return {
        ...game,
        ...buildCardEntry(game, coversBasePath)
    };
}