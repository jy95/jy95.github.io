import type { BacklogEntry } from './details';
import type { CardGame } from './types';
import { buildWatchRoute } from './youtube';

type WatchAvailability = {
    publishedOnly: boolean;
    isPublished: boolean;
};

/** Published catalogue membership confirms availability even without availableAt. */
export function availableWatchRoute(
    game: BacklogEntry | CardGame,
    { publishedOnly, isPublished }: WatchAvailability,
    now = new Date(),
) {
    if (!('url_type' in game)) return null;
    if (publishedOnly || isPublished) {
        return isPublished ? buildWatchRoute(game.url_type, game.id) : null;
    }
    if (!game.availableAt || !(new Date(game.availableAt) <= now)) return null;
    return buildWatchRoute(game.url_type, game.id);
}
