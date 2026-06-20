import Image from 'next/image';
import CardMedia from "@mui/material/CardMedia";
import type { CardAspectRatio } from './types';

type ImageProps = {
    src: string; 
    alt: string;
    ratio: CardAspectRatio;
    objectFit?: 'fill' | 'cover' | 'contain';
};

const RATIO_PADDING_MAP: Record<CardAspectRatio, string> = {
    square: '100%',     // 1:1 original ratio
    portrait: '133.33%', // 3:4 aspect ratio
    video: '56.25%',    // 16:9 aspect ratio
};

export function CardMediaImage({ src, alt, ratio, objectFit = 'fill' }: ImageProps) {
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
                    style={{ objectFit: objectFit }}
                    sizes="(max-width: 600px) 45vw, (max-width: 960px) 30vw, 15vw"
                    priority={false}
                />
            </div>
        </CardMedia>
    );
}