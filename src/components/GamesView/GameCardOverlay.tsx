"use client";

import Typography from "@mui/material/Typography";

import type { CardGame } from "@/redux/sharedDefintion";

interface GameCardOverlayProps {
    game: CardGame;
}

export default function GameCardOverlay({ game }: GameCardOverlayProps) {
    // Relying safely on title, and optionally handling duration if it exists on your type
    const { title } = game;

    return (
        <>
            {/* Modern MUI sx pattern for title styling */}
            <Typography 
                variant="subtitle1" 
                sx={{ 
                    fontWeight: "bold", 
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis" 
                }}
            >
                {title}
            </Typography>
        </>
    );
}