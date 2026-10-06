import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from "@/lib/supabase/client";
import { api } from "./api"

const supabase = createClient();

const supabaseError = (message: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

export const votesAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('games_stats')
          .select('game_slug, likes_count');
        if (error) return { error: supabaseError(error.message) };

        return { data: Object.fromEntries(data.map(row => [row.game_slug, row.likes_count])) };
      },
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      queryFn: async (userId) => {
        if (!userId) return { data: [] };

        const { data, error } = await supabase
          .from('games_likes')
          .select('game_slug')
          .eq('user_id', userId);
        if (error) return { error: supabaseError(error.message) };

        return { data: data.map(vote => vote.game_slug) };
      },
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, { slug: string; userId: string; hasVoted: boolean }>({
      queryFn: async ({ slug, userId, hasVoted }) => {
        const likes = supabase.from('games_likes');
        const row = { game_slug: slug, user_id: userId };

        const { error } = await (hasVoted ? likes.delete().match(row) : likes.insert(row));
        return error ? { error: supabaseError(error.message) } : { data: undefined };
      },

      // Optimistic update of both caches, rolled back if the write fails.
      async onQueryStarted({ slug, hasVoted, userId }, { dispatch, queryFulfilled }) {
        const delta = hasVoted ? -1 : 1;

        const patchStats = dispatch(
          votesAPI.util.updateQueryData('getGlobalStats', undefined, (draft) => {
            draft[slug] = Math.max(0, (draft[slug] ?? 0) + delta);
          })
        );
        const patchUser = dispatch(
          votesAPI.util.updateQueryData('getMyVotes', userId, (draft) =>
            hasVoted ? draft.filter(votedSlug => votedSlug !== slug) : [...draft, slug]
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchStats.undo();
          patchUser.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } = votesAPI;
