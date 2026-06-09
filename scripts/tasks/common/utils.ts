import type { Platform, GameGenre, IdentifierKind } from "./types";

const PLATFORMS_MAP = {
    'PC': 1,
    'GBA': 2,
    'PSP': 3,
    'PS1': 4,
    'PS2': 5,
    'PS3': 6
}
const GENRES_MAP = {
    'Action': 1,
    'Adventure': 2,
    'Arcade': 3,
    'Board Games': 4,
    'Card': 5,
    'Casual': 6,
    'Educational': 7,
    'Family': 8,
    'Fighting': 9,
    'Indie': 10,
    'MMORPG': 11,
    'Platformer': 12,
    'Puzzle': 13,
    'RPG': 14,
    'Racing': 15,
    'Shooter': 16,
    'Simulation': 17,
    'Sports': 18,
    'Strategy': 19,
    'Misc': 20
};

export function platformToInt(platform: Platform) {
    return PLATFORMS_MAP[platform] || 0;
}

export function genreToInt(genre: GameGenre) {
    return GENRES_MAP[genre] || 0;
}

export function identifierKindToDatabaseField(identifierKind: IdentifierKind) {
    return identifierKind.includes("Video") ? "videoId" : "playlistId";
}

// For the json parse reviver
// Library to parse forms answers considers them as multiple whereas it isn't
const keysToTransform = ["identifierKind", "platform", "tierList", "category"];

export function turnStringToObj(taskPayloadAsString: string) {
    return JSON.parse(taskPayloadAsString, (key, value) => {
        // Determine if the key is in the transform list
        const isKeyToTransform = keysToTransform.includes(key);

        // Check if the value is an array and if it should be transformed
        const shouldTransform = isKeyToTransform && Array.isArray(value);

        // Return undefined for empty arrays, the first element for single-element arrays, and the original value otherwise
        if (shouldTransform) {
            if (value.length === 0) {
                return undefined;
            } else if (value.length === 1) {
                return value[0];
            }
        }

        // Return the original value if no transformation is needed
        return value;
    });
}

export function findIdsInTextArea(textAreaContent?: string) {
    if (!textAreaContent) return [];

    return textAreaContent.split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);
}
