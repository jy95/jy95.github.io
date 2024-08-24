// Hooks
import { useState, useEffect } from 'react';
import { useLazyGetGamesQuery } from "@/redux/services/gamesAPI";
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
    const [allGames, setAllGames] = useState<CardGame[]>([]);
    const t = useTranslations('common');

    const LIMIT_PAGE = 16;
    const filtersAsString = JSON.stringify(activeFilters);

    // Lazy query setup
    const [triggerGetGames, { data, isFetching }] = useLazyGetGamesQuery();

    // Trigger the query when the page changes
    useEffect(() => {
            triggerGetGames({
                filters: activeFilters,
                pageSize: LIMIT_PAGE,
                page: page,
            });
        },
        // eslint-disable-next-line
        [page]
    );

    // Update the accumulated results when new data arrives
    useEffect(() => {
        if (data?.items) {
            setAllGames((prevGames) => [...prevGames, ...data.items]);
        }
    }, [data?.items]);

    // Reset the games list and page if filters change
    useEffect(() => {
        setAllGames([]);
        setPage(1);
        triggerGetGames({
            filters: activeFilters,
            pageSize: LIMIT_PAGE,
            page: 1
        });
    }, [filtersAsString]);

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
