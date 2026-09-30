"use client";

import Chip from "@mui/material/Chip";
import { useRouter } from "@/i18n/routing";
import { filtersToSearchParams } from "@/lib/gamesFilterUtils";
import { useGetPlatformsQuery } from "@/redux/services/platformsAPI";
import RenderPlatformIcon from "@/features/games/components/PlatformIcons";

export default function GamePlatform({ platformId }: { platformId: number }) {
    const router = useRouter();
    const { data } = useGetPlatformsQuery();
    const platform = data?.find(entry => entry.id === platformId);
    if (!platform) return null;

    return (
        <Chip
            label={platform.name}
            icon={<RenderPlatformIcon identifier={platformId} />}
            size="small"
            variant="outlined"
            sx={{ mb: 3 }}
            onClick={() => router.push({
                pathname: "/games",
                query: Object.fromEntries(filtersToSearchParams({ platform: platformId })),
            })}
        />
    );
}
