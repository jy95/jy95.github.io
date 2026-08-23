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

        const stats = data.reduce((acc: Record<string, number>, curr: { game_slug: string; likes_count: number }) => {
          acc[curr.game_slug] = curr.likes_count;
          return acc;
        }, {});

        return { data: stats };
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
        return { data: data.map(v => v.game_slug) };
      },
      providesTags: ['MyVotes'],
    }),
    toggleVote: builder.mutation<void, { slug: string; userId: string; hasVoted: boolean }>({
      queryFn: async ({ slug, userId, hasVoted }) => {
        if (hasVoted) {
          const { error } = await supabase
            .from('games_likes')
            .delete()
            .match({ game_slug: slug, user_id: userId });
          if (error) return { error: supabaseError(error.message) };
        } else {
          const { error } = await supabase
            .from('games_likes')
            .insert({ game_slug: slug, user_id: userId });
          if (error) return { error: supabaseError(error.message) };
        }
        return { data: undefined };
      },
      async onQueryStarted({ slug, hasVoted, userId }, { dispatch, queryFulfilled }) {
        const patchStats = dispatch(
          votesAPI.util.updateQueryData('getGlobalStats', undefined, (draft) => {
            if (draft[slug] !== undefined) {
              draft[slug] += hasVoted ? -1 : 1;
            } else if (!hasVoted) draft[slug] = 1;
          })
        );
        const patchUser = dispatch(
          votesAPI.util.updateQueryData('getMyVotes', userId, (draft) => {
            return hasVoted ? draft.filter(s => s !== slug) : [...draft, slug];
          })
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
