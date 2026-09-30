"use client";

import Chip from "@mui/material/Chip";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { filtersToSearchParams } from "@/lib/gamesFilterUtils";
import { useGetPlatformsQuery } from "@/redux/services/platformsAPI";
import RenderPlatformIcon from "@/features/games/components/PlatformIcons";
import InfoRow from "./rows/InfoRow";

export default function GamePlatform({ platformId }: { platformId: number }) {
    const router = useRouter();
    const t = useTranslations("gameDetail");
    const { data } = useGetPlatformsQuery();
    const platform = data?.find(entry => entry.id === platformId);
    if (!platform) return null;

    return (
        <InfoRow
            label={t("platforms", { count: 1 })}
            icon={<RenderPlatformIcon identifier={platformId} />}
            value={
                <Chip
                    component="span"
                    label={platform.name}
                    icon={<RenderPlatformIcon identifier={platformId} />}
                    size="small"
                    variant="outlined"
                    onClick={() => router.push({
                        pathname: "/games",
                        query: Object.fromEntries(filtersToSearchParams({ platform: platformId })),
                    })}
                />
            }
        />
    );
}
