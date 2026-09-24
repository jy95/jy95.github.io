"use client";

import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import BaseCard from "@/features/games/components/BaseCard";

export type CompanyCardEntry = {
    id: number;
    title: string;
    imagePath: string;
    gamesCount: number;
};

export default function CompanyCard({ company }: { company: CompanyCardEntry }) {
    const router = useRouter();
    const t = useTranslations("companies");

    return (
        <BaseCard
            item={company}
            aspectRatio="square"
            objectFit="contain"
            overlayPersistent
            onClick={(item) => router.push({ pathname: "/companies/[id]", params: { id: String(item.id) } })}
            overlaySlot={(item) => (
                <>
                    <Typography variant="subtitle2" sx={{ overflowWrap: "anywhere" }}>{item.title}</Typography>
                    <Typography variant="caption">{t("gamesCount", { count: item.gamesCount })}</Typography>
                </>
            )}
        />
    );
}
