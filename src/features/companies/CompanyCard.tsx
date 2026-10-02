"use client";

import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createCardFactory } from "@/features/games/components/cardFactory";

export type CompanyCardEntry = {
    id: number;
    title: string;
    imagePath: string;
    gamesCount: number;
};

const CompanyCardFactory = createCardFactory<CompanyCardEntry>({
    aspectRatio: "square",
    objectFit: "contain",
    overlayPersistent: true,
});

export default function CompanyCard({ company }: { company: CompanyCardEntry }) {
    const router = useRouter();
    const t = useTranslations("companies");

    return (
        <CompanyCardFactory
            item={company}
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
