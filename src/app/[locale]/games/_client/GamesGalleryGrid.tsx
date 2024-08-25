// Hooks
import { useState } from 'react';
import { useGetGamesQuery } from "@/redux/services/gamesAPI";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from 'next-intl';

// Style
import Grid from "@mui/material/Grid";
import LoadingButton from './LoadingButton';

// Custom
import CardEntry from "@/components/GamesView/CardEntry";
import GamesFilters from "./GamesFilters";

// Types
import type { CardGame } from "@/redux/sharedDefintion";

export default function GamesGalleryGrid() {
    return (
        <div>
            <GamesFilters />
            <GamesGalleryGridInner />
        </div>
    );
}

function GamesGalleryGridInner() {
    
    // Active filters
    const activeFilters = useAppSelector((state) => state.games.activeFilters);

    const [page, setPage] = useState(1);
    const t = useTranslations('common');

    const LIMIT_PAGE = 16;

    // Lazy query setup
    const { data, isFetching } = useGetGamesQuery(
        {
            filters: activeFilters,
            pageSize : LIMIT_PAGE,
            page: page
        },
        {
            refetchOnMountOrArgChange: true
        }
    );
    const allGames = data?.items ?? [];

    const renderRow = (game: CardGame) => (
        <Grid 
            key={game.id}
            item
            xs={6}
            md={4}
            lg={1.5}
        >
            <CardEntry game={game}/>
        </Grid>
    );

    return (
        <>
            <Grid 
                container 
                spacing={1}
                style={{ rowGap: "15px" }}
            >
                {allGames.map(renderRow)}
            </Grid>
            <div style={{
                justifyContent: "center",
                display: "flex",
                marginTop: "15px"
            }}>
                <LoadingButton
                    loading={isFetching}
                    disabled={ page >= (data?.total_pages || 1) }
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    <span>{t('loadMore')}</span>
                </LoadingButton>
            </div> 
        </>
    );
}
