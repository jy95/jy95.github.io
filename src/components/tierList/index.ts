import type { ElementType } from "react";

export interface RawType {
    // Identifier of the ressource 
    id?: string
}

// A function that renders each game item
export type GameRender<T extends RawType> = ElementType<{ game: T }>;
