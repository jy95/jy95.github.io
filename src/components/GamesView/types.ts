import type { ReactNode } from 'react';

export type CommonProps = {
    title: string; 
    imagePath: string;
};

/**
 * Defines the aspect ratio configurations for the card media container.
 * @property {'square'} square - 1:1 aspect ratio layout (Original configuration).
 * @property {'portrait'} portrait - 3:4 aspect ratio layout, optimized for standard video game cover art.
 * @property {'video'} video - 16:9 widescreen aspect ratio layout, ideal for horizontal banners or video thumbnails.
 */
export type CardAspectRatio = 'square' | 'portrait' | 'video';

export interface BaseCardProps<T extends CommonProps> {
    item: T;
    onClick?: (item: T) => void;
    badgesSlot?: (item: T) => ReactNode;  
    overlaySlot?: (item: T) => ReactNode;
    aspectRatio?: CardAspectRatio; 
}