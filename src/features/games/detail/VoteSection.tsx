"use client";

import { Stack, Typography, Chip, CircularProgress } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useTranslations } from "next-intl";
import { useGameVote } from './useGameVote';

export default function VoteSection({ slug }: { slug: string }) {
  const t = useTranslations("vote");
  const { count, hasVoted, isLoading, handleAction } = useGameVote(slug);

  return (
    <Stack spacing={1.5} sx={{ my: 3, alignItems: 'flex-start' }}>
      {/* Disclaimer discret et aéré */}
      <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', opacity: 0.8 }}>
        <InfoOutlinedIcon fontSize="inherit" sx={{ mt: 0.3 }} />
        <Typography variant="caption" sx={{ lineHeight: 1.4, maxWidth: 600 }}>
          {t("disclaimer")}
        </Typography>
      </Stack>

      <Chip
        disabled={isLoading}
        onClick={handleAction}
        color={hasVoted ? "primary" : "default"}
        variant={hasVoted ? "filled" : "outlined"}
        icon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        avatar={!isLoading ? (hasVoted ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />) : undefined}
        label={`${count} • ${hasVoted ? t("voted") : t("voteAction")}`}
        sx={{ 
          fontWeight: 700,
          cursor: 'pointer',
          '&:hover': { transform: 'translateY(-1px)' },
          transition: 'transform 0.1s'
        }}
      />
    </Stack>
  );
}
