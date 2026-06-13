"use client";

import Image from 'next/image';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from '@mui/material/CardActionArea';

type CommonProps = {
    title: string; 
    imagePath: string
}

export interface BaseCardProps<T extends CommonProps> {
    item: T;
    onClick?: (item: T) => void;
}

export default function BaseCard<T extends CommonProps>({ 
    item, 
    onClick 
}: BaseCardProps<T>) {

    // Extract props
    const { title, imagePath } = item;

    return (
        <Card sx={{ position: "relative" }}>
            <CardActionArea 
                onClick={() => onClick && onClick(item)} 
                disabled={!onClick}
                sx={{ height: "inherit", zIndex: 1 }}
            >
                <CardMedia
                    sx={{ zIndex: 1, height: "inherit" }}
                    title={title}
                >
                    <div style={{
                        paddingTop: "100%",
                        position: "relative",
                    }}>
                        <Image 
                            fill
                            src={imagePath}
                            alt={title}
                            objectFit="fill"
                            sizes="(max-width: 600px) 45vw, (max-width: 960px) 30vw, 15vw"
                        />
                    </div>
                </CardMedia>
            </CardActionArea>
        </Card>
    );

}