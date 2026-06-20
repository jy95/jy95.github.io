import type { ReactNode } from 'react';

export type CommonProps = {
    title: string; 
    imagePath: string;
};

/**
 * Defines the aspect ratio configurations for the card media container.
 */
export type CardAspectRatio = 'square' | 'portrait' | 'video';

export interface BaseCardProps<T extends CommonProps> {
    item: T;
    onClick?: (item: T) => void;
    badgesSlot?: (item: T) => ReactNode;  
    overlaySlot?: (item: T) => ReactNode;
    aspectRatio?: CardAspectRatio; 
}