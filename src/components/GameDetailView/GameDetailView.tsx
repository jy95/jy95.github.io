"use client";

// Hooks
import { useRouter } from '@/i18n/routing';
import { useState } from "react";
import { useTranslations } from "next-intl";

// Next.js
import Image from 'next/image';

// Material UI
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';

// Components
import GameToolbar from "./GameToolbar";
import InfoRow from "./InfoRow";
import GameGenres from './GameGenres';

// Icons
import YouTubeIcon from '@mui/icons-material/YouTube';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Types
import type { CardGame } from "@/redux/sharedDefintion";

// Extra properties that are not in CardGame but we might want to display in GameDetailView
type ExtraGameProperties = {
    /** @description When the game was released, such "2005-12-22" */
    releaseDate?: string;
    /** @description Genres of the game */
    genres?: number[];
}

function GameDetailView(props : {
    game: CardGame & ExtraGameProperties;
    onClose: () => void;
}) {

    // hooks
    const router = useRouter();
    const [open, setOpen] = useState(true);
    const t = useTranslations();

    // props
    const {game} = props;

    function watchGame() {
        router.push({
            pathname: game.url_type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
            params: { id: game.id }
        });
    }

    function handleClose() {
        setOpen(false);
        props.onClose();
    }

    function isPublic() {
        // if no release date, consider it private
        //if (!game.availableAt) return false;
        return true;
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "TBA";
        return new Date(dateStr).toLocaleDateString();
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={() => handleClose()}
        >
            {/* --- Toolbar --- */}
            <GameToolbar 
                gameTitle={game.title}
                onClose={() => handleClose()}
            />

            {/* --- Content --- */}
            <Box sx={{ p: { xs: 2, md: 5 }, flexGrow: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">

                    {/* --- Game cover --- */}
                    <Box sx={{ position: 'relative', width: 300, height: 400 }}>
                        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                            <Image
                                fill
                                style={{ objectFit: 'cover' }}
                                src={game.imagePath}
                                alt={game.title}
                            />
                        </Paper>

                        {isPublic() && (
                            <Button 
                                variant="contained"
                                startIcon={<YouTubeIcon />} 
                                onClick={watchGame}
                                color='error'
                            >
                                Youtube
                            </Button>
                        )}

                    </Box>

                    {/* --- Game details --- */}
                    <Box sx={{ flex: 1 }}>

                        {game.genres && <GameGenres genreIds={game.genres} />}

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={3}>
                            <InfoRow label="RELEASED AT" value={formatDate(game.releaseDate)} icon={<CalendarTodayIcon fontSize="small" />} />
                            <InfoRow label="DURATION" value={game.duration || "00:00:00"} icon={<AccessTimeIcon fontSize="small" />} />
                        </Stack>
                    </Box>

                </Stack>
            </Box>
        </Dialog>
    );
}

export default GameDetailView;