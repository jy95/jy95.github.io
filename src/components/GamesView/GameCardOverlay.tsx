"use client";

import Box from "@mui/material/Box";
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

            {/* Visual CTA Button */}
            <Box 
                sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    textAlign: 'center',
                    py: 0.8,
                    borderRadius: 1,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                }}
            >
                Watch
            </Box>
        </>
    );
}