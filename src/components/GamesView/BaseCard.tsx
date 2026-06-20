"use client";

// UI MUI
import Card from "@mui/material/Card";
import CardActionArea from '@mui/material/CardActionArea';

// Types & Components locaux
import type { CommonProps, BaseCardProps } from './types';
import { CardMediaImage } from './CardMediaImage';
import { CardBadgesLayer, CardOverlayLayer } from './CardLayers';

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