"use client";

import { useLocale, useTranslations } from "next-intl";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { Link } from '@/i18n/routing';

type Props = { id: string; title: string };

export default function GameDetailsButton({ id, title }: Props) {
    const locale = useLocale();
    const t = useTranslations("gameDetail");
    const label = t("details", { title });

    return (
        <Tooltip title={label}>
            <IconButton
                component={Link}
                locale={locale}
                href={{ pathname: "/games/detail/[id]", params: { id } }}
                aria-label={label}
                onClick={(event) => event.stopPropagation()}
                sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
            >
                <InfoOutlinedIcon />
            </IconButton>
        </Tooltip>
    );
}
