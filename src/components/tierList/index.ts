import type { ElementType, CSSProperties } from "react";

export interface RawType {
    // Identifier of the resource 
    id?: string
}

// A function that renders each game item
export type GameRender<T extends RawType> = ElementType<{ game: T }>;

// Background color
export type BackgroundColor = CSSProperties["backgroundColor"];

// Export for external use
export { TierRow } from "./TierRow";
export { TierLists } from "./TierLists";