import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

// 1. Badges Layer (Always visible on top of the image)
export function CardBadgesLayer({ children }: { children: ReactNode }) {
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

// 2. Overlay Layer (Revealed on Hover / Keyboard Focus)
export function CardOverlayLayer({ children }: { children: ReactNode }) {
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