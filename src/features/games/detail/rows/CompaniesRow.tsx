"use client";

import { useTranslations } from "next-intl";
import BusinessIcon from "@mui/icons-material/Business";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useRouter } from "@/i18n/routing";
import InfoRow from "./InfoRow";
import type { GameDetailsEntry } from "../types";

export default function CompaniesRow({ game }: { game: GameDetailsEntry }) {
    const t = useTranslations("gameDetail");
    const router = useRouter();
    if (game.kind !== "card") return null;

    return (
        <>
            {(["developers", "publishers"] as const).map((role) => {
                const companies = game[role];
                if (!companies?.length) return null;

                return (
                    <InfoRow
                        key={role}
                        label={t(role, { count: companies.length })}
                        icon={<BusinessIcon fontSize="small" />}
                        value={
                            <Stack component="span" direction="row" useFlexGap spacing={1} sx={{ flexWrap: "wrap" }}>
                                {companies.map((company) => (
                                    <Chip
                                        component="span"
                                        key={company.id}
                                        label={company.name}
                                        size="small"
                                        variant="outlined"
                                        onClick={() => router.push({
                                            pathname: "/companies/[id]",
                                            params: { id: String(company.id) },
                                        })}
                                    />
                                ))}
                            </Stack>
                        }
                    />
                );
            })}
        </>
    );
}
