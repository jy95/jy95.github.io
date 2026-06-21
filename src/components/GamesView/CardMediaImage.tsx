import Image from 'next/image';
import CardMedia from "@mui/material/CardMedia";
import type { CardAspectRatio } from './types';

type ImageProps = {
    // The source URL or path of the image to display.
    src: string;
    // The alternative text for accessibility (screen readers) and SEO optimization.
    alt: string;
    /** 
     * The structural aspect ratio configuration for the image container box.
     * Maps to pre-configured padding-top percentages (e.g., 'portrait' = 3:4 ratio).
     */
    ratio: CardAspectRatio;
    /** 
     * Defines how the image scales and cuts into its aspect-ratio box context.
     * - 'fill': Stretches the image to fit the container perfectly (can distort).
     * - 'cover': Crops and centers the image to fill the container without distortion (ideal for cards/covers).
     * - 'contain': Letterboxes the image so the entire file fits inside without clipping.
     * @default 'fill'
     */
    objectFit?: 'fill' | 'cover' | 'contain';
    /** 
     * A layout-responsive hint string given to Next.js to determine image source size optimization.
     * Tells the browser how wide the image will render at various media query breakpoints.
     * @example '(max-width: 600px) 100vw, 33vw'
     */
    sizes?: string;
};

const RATIO_PADDING_MAP: Record<CardAspectRatio, string> = {
    square: '100%',     // 1:1 original ratio
    portrait: '133.33%', // 3:4 aspect ratio
    video: '56.25%',    // 16:9 aspect ratio
};

export function CardMediaImage({
    src,
    alt,
    ratio,
    objectFit = 'fill',
    sizes = "(max-width: 600px) 45vw, (max-width: 960px) 30vw, 15vw"
}: ImageProps) {
    return (
        <CardMedia
            sx={{
                zIndex: 1,
                width: '100%',        // Force full width of the grid item
                height: 'auto',       // Let height be driven by the inner padding
                position: 'relative', // Essential container context for Next.js fill
                display: 'block',     // Block layout to ensure no inline whitespace gaps
            }}
        >
            <div style={{
                paddingTop: RATIO_PADDING_MAP[ratio],
                position: "relative",
                width: "100%"
            }}>
                <Image
                    fill
                    src={src}
                    alt={alt}
                    style={{ objectFit: objectFit }}
                    sizes={sizes}
                    priority={false}
                />
            </div>
        </CardMedia>
    );
}