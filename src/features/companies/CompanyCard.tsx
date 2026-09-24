"use client";

import Chip from "@mui/material/Chip";
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

    return (
        <BaseCard
            item={company}
            aspectRatio="square"
            onClick={(item) => router.push({ pathname: "/companies/[id]", params: { id: String(item.id) } })}
            badgesSlot={(item) => (
                <Chip
                    size="small"
                    color="primary"
                    label={item.gamesCount}
                    sx={{ alignSelf: "flex-end" }}
                />
            )}
        />
    );
}