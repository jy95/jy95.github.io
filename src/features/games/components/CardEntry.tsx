"use client";

// Hooks
import { useLocale, useTranslations } from "next-intl";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link, useRouter } from '@/i18n/routing';

// Reusable functions
import { buildWatchRoute } from "@/domain/games/youtube";

// UI
import BaseCard from "./BaseCard";
import GameCardOverlay from "./GameCardOverlay";

// Types
import type { CardGame } from "@/domain/games";

function CardEntry({ game }: { game: CardGame }) {

    // hooks
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("gameDetail");

    return (
        <BaseCard 
            item={game}
            onClick={(item) => router.push(buildWatchRoute(item.url_type, item.id))}
            actionsSlot={(item) => (
                <Tooltip title={t("details", { title: item.title })}>
                    <IconButton
                        component={Link}
                        locale={locale}
                        href={{ pathname: "/games/detail/[id]", params: { id: item.id } }}
                        aria-label={t("details", { title: item.title })}
                        onClick={(event) => event.stopPropagation()}
                        sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
                    >
                        <InfoOutlinedIcon />
                    </IconButton>
                </Tooltip>
            )}
            overlaySlot={(item) => <GameCardOverlay game={item} />}
        />
    );
}

export default CardEntry;