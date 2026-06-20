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
import VoteSection from "./VoteSection";
import { CardMediaImage } from '../GamesView/CardMediaImage';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Types
import type { BacklogEntry } from "@/app/api/backlog/route";
import type { CardGame } from "@/redux/sharedDefintion";

// Many fields are optional
type GameDetailsEntry = BacklogEntry | CardGame;

// --- The Ultimate Union-Safe hasKey Utility ---
// Instead of intersecting, we look at each member of the Union (T). 
// If the member can contain the key K, we extract it. 
// If it can't, we explicitly map K to V so TypeScript knows it's safe to read.
type WithProperty<T, K extends PropertyKey, V> = T extends any
    ? K extends keyof T
        ? T & { [P in K]: V }
        : T & { [P in K]: V }
    : never;

function hasKey<T extends object, K extends PropertyKey, V>(
    obj: T,
    key: K,
    validator: (value: unknown) => value is V
): obj is WithProperty<T, K, V> {
    return key in obj && validator((obj as any)[key]);
}

function hasGenres(game: GameDetailsEntry): game is GameDetailsEntry & { genres: number[] } {
    return hasKey(game, "genres", (val): val is number[] => Array.isArray(val) && val.length > 0);
}

function hasDuration(game: GameDetailsEntry): game is GameDetailsEntry & { duration: string } {
    return hasKey(game, "duration", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

function hasReleaseDate(game: GameDetailsEntry): game is GameDetailsEntry & { releaseDate: string } {
    return hasKey(game, "releaseDate", (val): val is string => typeof val === "string");
}

function hasHltbMain(game: GameDetailsEntry): game is BacklogEntry & { hltb_main: string } {
    return hasKey(game, "hltb_main", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

function hasHltbExtra(game: GameDetailsEntry): game is GameDetailsEntry & { hltb_extra: string } {
    return hasKey(game, "hltb_extra", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

function hasHltbCompletionist(game: GameDetailsEntry): game is GameDetailsEntry & { hltb_completionist: string } {
    return hasKey(game, "hltb_completionist", (val): val is string => typeof val === "string" && val !== "00:00:00");
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
}

function GameDetailView(props : {
    game: GameDetailsEntry;
    onClose: () => void;
    /** @default true */
    showVoteSection?: boolean;
}) {

    // hooks
    const [open, setOpen] = useState(true);
    const t = useTranslations();

    // props
    const {game , showVoteSection = true} = props;

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
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'flex-start' }}>

                    {/* --- Game cover --- */}
                    <Box sx={{ width: 300, mb: 2 }}>
                        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <CardMediaImage 
                                src={game.imagePath} 
                                alt={game.title} 
                                ratio="portrait"
                                objectFit="cover"
                            />
                        </Paper>
                    </Box>

                    {/* --- Game details --- */}
                    <Box sx={{ flex: 1 }}>

                        {showVoteSection && (
                            <>
                                <VoteSection slug={game.id} />
                                <Divider sx={{ mb: 3 }} />
                            </>
                        )}

                        {hasGenres(game) && (
                            <>
                                <GameGenres genreIds={game.genres} />
                                <Divider sx={{ mb: 3 }} />
                            </>
                        )}

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