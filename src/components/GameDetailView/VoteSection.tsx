"use client";

import { useEffect, useState } from "react";
import { Button, Stack, Typography, CircularProgress, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// Internationalization
import { useTranslations } from "next-intl";

// Redux & Supabase
import { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } from "@/redux/services/votesAPI";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function VoteSection({ slug }: { slug: string }) {
  const t = useTranslations("vote");
  const [userId, setUserId] = useState<string | undefined>();

  // Gestion de l'auth en autonomie
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hooks Redux (respectent ta signature de service avec userId)
  const { data: stats } = useGetGlobalStatsQuery();
  const { data: myVotes } = useGetMyVotesQuery(userId, { skip: !userId });
  const [toggle, { isLoading }] = useToggleVoteMutation();

  const count = stats?.[slug] || 0;
  const hasVoted = myVotes?.includes(slug) || false;

  const handleVote = () => {
    if (userId) {
      toggle({ slug, userId, hasVoted });
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 2 }}>
      <Tooltip title={!userId ? t("loginRequired") : ""}>
        <span>
          <Button
            variant={hasVoted ? "contained" : "outlined"}
            color="error"
            disabled={isLoading || !userId}
            startIcon={isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              hasVoted ? <FavoriteIcon /> : <FavoriteBorderIcon />
            )}
            onClick={handleVote}
            sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 'bold' }}
          >
            {hasVoted ? t("voted") : t("voteAction")}
          </Button>
        </span>
      </Tooltip>

      <Stack>
        <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
          {count}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {/* Utilise la gestion du pluriel native de next-intl */}
          {t("voteCount", { count })}
        </Typography>
      </Stack>
    </Stack>
  );
}