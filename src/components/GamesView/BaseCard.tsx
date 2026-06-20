"use client";

import Image from 'next/image';

// UI
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';

import type { ReactNode } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
type CommonProps = {
    title: string; 
    imagePath: string;
}

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

// ==========================================
// SUB-COMPONENTS (Layer Management)
// ==========================================

// 1. Media Layer (CardMedia + Next.js Image wrapper)
type ImageProps = {
    src: string; 
    alt: string;
    ratio: CardAspectRatio
}
function CardMediaImage({ src, alt, ratio }: ImageProps) {

    const RATIO_PADDING_MAP: Record<CardAspectRatio, string> = {
        square: '100%',     // 1:1 original ratio
        portrait: '133.33%', // 3:4 aspect ratio
        video: '56.25%',    // 16:9 aspect ratio
    };

    return (
        <CardMedia
            sx={{
                zIndex: 1,
                height: "inherit",
            }}
        >
            <div style={{
                paddingTop: RATIO_PADDING_MAP[ratio],
                position: "relative",
            }}>
                <Image 
                    fill
                    src={src}
                    alt={alt}
                    style={{ objectFit: "fill" }}
                    sizes="(max-width: 600px) 45vw, (max-width: 960px) 30vw, 15vw"
                    priority={false}
                />
            </div>
        </CardMedia>
    );
}

// 2. Badges Layer (Always visible on top of the image)
function CardBadgesLayer({ children }: { children: ReactNode }) {
    return (
        <Box sx={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 2,
            pointerEvents: 'none', // Allows clicks to pass through to the CardActionArea
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1.5
        }}>
            {children}
        </Box>
    );
}

// 3. Overlay Layer (Revealed on Hover / Keyboard Focus)
function CardOverlayLayer({ children }: { children: ReactNode }) {
    return (
        <Box 
            className="card-overlay"
            sx={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'common.white',
                opacity: 0, // Hidden by default
                transition: 'opacity 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: 2,
            }}
        >
            {children}
        </Box>
    );
}

// ==========================================
// MAIN COMPONENT (The Assembler)
// ==========================================
export default function BaseCard<T extends CommonProps>({ 
    item, 
    onClick,
    badgesSlot,
    overlaySlot,
    aspectRatio = 'square'
}: BaseCardProps<T>) {

    const { title, imagePath } = item;

    return (
        <Card sx={{ 
            position: "relative",
            // Handles hover states for the absolute layers
            '&:hover .card-overlay': { opacity: 1 },
            '&:focus-within .card-overlay': { opacity: 1 }
        }}>
            <CardActionArea 
                onClick={() => onClick && onClick(item)} 
                disabled={!onClick}
                sx={{ position: 'relative', display: 'block' }}
            >
                {/* Layer 1: Background Cover Image */}
                <CardMediaImage src={imagePath} alt={title} ratio={aspectRatio} />

                {/* Layer 2: Permanent Badges */}
                {badgesSlot && (
                    <CardBadgesLayer>
                        {badgesSlot(item)}
                    </CardBadgesLayer>
                )}

                {/* Layer 3: Hover/Focus Details Overlay */}
                {overlaySlot && (
                    <CardOverlayLayer>
                        {overlaySlot(item)}
                    </CardOverlayLayer>
                )}
            </CardActionArea>
        </Card>
    );
}