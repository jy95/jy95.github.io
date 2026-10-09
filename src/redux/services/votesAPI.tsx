
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from '@/lib/supabase/client';
import { api } from './api';

const supabase = createClient();

type Vote = {
  slug: string;
  userId: string;
  hasVoted: boolean;
};

type UndoablePatch = { undo: () => void };

const toApiError = (message: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

const apiError = (error: { message: string } | null) =>
  error ? { error: toApiError(error.message) } : undefined;

async function fetchGlobalStats() {
  const { data, error } = await supabase
    .from('games_stats')
    .select('game_slug, likes_count');

  const failure = apiError(error);
  if (failure) return failure;

  return {
    data: Object.fromEntries(
      data.map(({ game_slug, likes_count }) => [game_slug, likes_count]),
    ),
  };
}

async function fetchMyVotes(userId: string | undefined) {
  if (!userId) return { data: [] as string[] };

  const { data, error } = await supabase
    .from('games_likes')
    .select('game_slug')
    .eq('user_id', userId);

  const failure = apiError(error);
  if (failure) return failure;

  return { data: data.map(({ game_slug }) => game_slug) };
}

async function persistVote({ slug, userId, hasVoted }: Vote) {
  const likes = supabase.from('games_likes');
  const row = { game_slug: slug, user_id: userId };

  const { error } = await (
    hasVoted
      ? likes.delete().match(row)
      : likes.insert(row)
  );

  const failure = apiError(error);
  return failure ?? { data: undefined };
}

async function rollbackOnFailure(
  request: Promise<unknown>,
  patches: UndoablePatch[],
) {
  try {
    await request;
  } catch {
    patches.forEach(({ undo }) => undo());
  }
}

export const votesAPI = api.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      queryFn: fetchGlobalStats,
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      queryFn: fetchMyVotes,
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, Vote>({
      queryFn: persistVote,

      async onQueryStarted(
        { slug, userId, hasVoted },
        { dispatch, queryFulfilled },
      ) {
        const delta = hasVoted ? -1 : 1;

        const patches = [
          dispatch(
            votesAPI.util.updateQueryData(
              'getGlobalStats',
              undefined,
              (stats) => {
                stats[slug] = Math.max(0, (stats[slug] ?? 0) + delta);
              },
            ),
          ),

          dispatch(
            votesAPI.util.updateQueryData(
              'getMyVotes',
              userId,
              (votes) =>
                hasVoted
                  ? votes.filter((vote) => vote !== slug)
                  : [...votes, slug],
            ),
          ),
        ];

        await rollbackOnFailure(queryFulfilled, patches);
      },
    }),
  }),
});

export const {
  useGetGlobalStatsQuery,
  useGetMyVotesQuery,
  useToggleVoteMutation,
} = votesAPI;
