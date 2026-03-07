"use client";

// Hooks
import { useState } from "react";
import { useTranslations } from "next-intl";

// Next.js
import Image from 'next/image';

// Material UI
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';

// Components
import GameToolbar from "./GameToolbar";
import InfoRow from "./InfoRow";
import GameGenres from './GameGenres';
import PrettyDuration from "./DurationRow";

// Icons
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
    /** @description Duration of the game in "hh:mm:ss" format */
    hltb_main?: string;
    /** @description Duration of the game including extras in "hh:mm:ss" format */
    hltb_extra?: string;
    /** @description Duration of the game including extras and completionist in "hh:mm:ss" format */
    hltb_completionist?: string;
}

function hasGenres(game: CardGame & ExtraGameProperties): game is CardGame & ExtraGameProperties & { genres: number[] } {
    return game.genres !== undefined && game.genres.length > 0;
}

function hasDuration(game: CardGame & ExtraGameProperties): game is CardGame & ExtraGameProperties & { duration: string } {
    return game.duration !== undefined && game.duration !== "00:00:00";
}

function hasReleaseDate(game: CardGame & ExtraGameProperties): game is CardGame & ExtraGameProperties & { releaseDate: string } {
    return game.releaseDate !== undefined;
}

function hasHltbMain(game: CardGame & ExtraGameProperties): game is CardGame & ExtraGameProperties & { hltb_main: string } {
    return game.hltb_main !== undefined && game.hltb_main !== "00:00:00";
}

function hasHltbExtra(game: CardGame & ExtraGameProperties): game is CardGame & ExtraGameProperties & { hltb_extra: string } {
    return game.hltb_extra !== undefined && game.hltb_extra !== "00:00:00";
}

function hasHltbCompletionist(game: CardGame & ExtraGameProperties): game is CardGame & ExtraGameProperties & { hltb_completionist: string } {
    return game.hltb_completionist !== undefined && game.hltb_completionist !== "00:00:00";
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
}

function GameDetailView(props : {
    game: CardGame & ExtraGameProperties;
    onClose: () => void;
}) {

    // hooks
    const [open, setOpen] = useState(true);
    const t = useTranslations();

    // props
    const {game} = props;

    function handleClose() {
        setOpen(false);
        props.onClose();
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={() => handleClose()}
        >
            {/* --- Toolbar --- */}
            <GameToolbar 
                game={game}
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
                    </Box>

                    {/* --- Game details --- */}
                    <Box sx={{ flex: 1 }}>

                        {hasGenres(game) && <GameGenres genreIds={game.genres} />}

                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={3}>
                            {hasReleaseDate(game) && <InfoRow label={t("gameDetail.releaseDate")} value={formatDate(game.releaseDate)} icon={<CalendarTodayIcon fontSize="small" />} />}
                            {hasDuration(game) && <InfoRow label={t("gameDetail.duration")} value={game.duration} icon={<AccessTimeIcon fontSize="small" />} />}
                            {hasHltbMain(game) && <InfoRow label={t("gameDetail.hltb_main")} value={<PrettyDuration duration={game.hltb_main} />} icon={<AccessTimeIcon fontSize="small" />} />}
                            {hasHltbExtra(game) && <InfoRow label={t("gameDetail.hltb_extra")} value={<PrettyDuration duration={game.hltb_extra} />} icon={<AccessTimeIcon fontSize="small" />} />}
                            {hasHltbCompletionist(game) && <InfoRow label={t("gameDetail.hltb_completionist")} value={<PrettyDuration duration={game.hltb_completionist} />} icon={<AccessTimeIcon fontSize="small" />} />}
                        </Stack>
                    </Box>

                </Stack>
            </Box>
        </Dialog>
    );
}

export default GameDetailView;