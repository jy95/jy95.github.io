import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from '@/lib/supabase/client';
import { api } from './api';

const supabase = createClient();

type VoteArgs = {
  slug: string;
  userId: string;
  hasVoted: boolean;
};

const supabaseError = (message: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

async function fetchGlobalStats() {
  const { data, error } = await supabase
    .from('games_stats')
    .select('game_slug, likes_count');

  if (error) return { error: supabaseError(error.message) };

  return {
    data: Object.fromEntries(
      data.map(({ game_slug, likes_count }) => [game_slug, likes_count]),
    ),
  };
}

async function fetchMyVotes(userId?: string) {
  if (!userId) return { data: [] as string[] };

  const { data, error } = await supabase
    .from('games_likes')
    .select('game_slug')
    .eq('user_id', userId);

  if (error) return { error: supabaseError(error.message) };

  return { data: data.map(({ game_slug }) => game_slug) };
}

async function writeVote({ slug, userId, hasVoted }: VoteArgs) {
  const likes = supabase.from('games_likes');
  const row = { game_slug: slug, user_id: userId };

  const { error } = await (hasVoted
    ? likes.delete().match(row)
    : likes.insert(row));

  return error
    ? { error: supabaseError(error.message) }
    : { data: undefined };
}

export const votesAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      queryFn: fetchGlobalStats,
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      queryFn: (userId) => fetchMyVotes(userId),
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, VoteArgs>({
      queryFn: (args) => writeVote(args),

      async onQueryStarted(
        { slug, hasVoted, userId },
        { dispatch, queryFulfilled },
      ) {
        const delta = hasVoted ? -1 : 1;

        const statsPatch = dispatch(
          votesAPI.util.updateQueryData(
            'getGlobalStats',
            undefined,
            (draft) => {
              draft[slug] = Math.max(0, (draft[slug] ?? 0) + delta);
            },
          ),
        );

        const votesPatch = dispatch(
          votesAPI.util.updateQueryData('getMyVotes', userId, (draft) =>
            hasVoted
              ? draft.filter((votedSlug) => votedSlug !== slug)
              : [...draft, slug],
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          statsPatch.undo();
          votesPatch.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGlobalStatsQuery,
  useGetMyVotesQuery,
  useToggleVoteMutation,
} = votesAPI;
