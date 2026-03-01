"use client";

import { useRouter } from '@/i18n/routing';
import { useState } from "react";

import { 
  Box, 
  Typography, 
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';

import YouTubeIcon from '@mui/icons-material/YouTube';
import CloseIcon from '@mui/icons-material/Close';

import Dialog from '@mui/material/Dialog';

import type { CardGame } from "@/redux/sharedDefintion";

function GameDetailView(props : {
    game: CardGame;
}) {

    // hooks
    const router = useRouter();
    const [open, setOpen] = useState(true);

    // props
    const {game} = props;

    function watchGame() {
        router.push({
            pathname: game.url_type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: game.id }
        });
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={() => setOpen(false)}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setOpen(false)}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {game.title}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Dialog>
    );
}

export default GameDetailView;