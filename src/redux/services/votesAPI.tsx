import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from "@/lib/supabase/client";
import { api } from "./api";

const supabase = createClient();

const supabaseError = (message: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

/**
 * Helper to standardize Supabase responses into RTK Query format.
 * Reduces cyclomatic complexity by removing repeated error branching.
 */
async function handleRequest<T>(promise: Promise<{ data: T | null; error: any }>) {
  const { data, error } = await promise;
  return error ? { error: supabaseError(error.message) } : { data };
}

export const votesAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      async queryFn() {
        const { data } = await handleRequest(
          supabase.from('games_stats').select('game_slug, likes_count')
        );
        
        const stats = Object.fromEntries(data?.map(row => [row.game_slug, row.likes_count]) ?? []);
        return { data: stats };
      },
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      async queryFn(userId) {
        if (!userId) return { data: [] };

        const { data } = await handleRequest(
          supabase.from('games_likes').select('game_slug').eq('user_id', userId)
        );

        return { data: data?.map(vote => vote.game_slug) ?? [] };
      },
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, { slug: string; userId: string; hasVoted: boolean }>({
      async queryFn({ slug, userId, hasVoted }) {
        const row = { game_slug: slug, user_id: userId };
        const operation = hasVoted 
          ? supabase.from('games_likes').delete().match(row) 
          : supabase.from('games_likes').insert(row);

        const { error } = await handleRequest(operation);
        return error ? { error } : { data: undefined };
      },

      async onQueryStarted({ slug, hasVoted, userId }, { dispatch, queryFulfilled }) {
        const delta = hasVoted ? -1 : 1;

        const patchStats = dispatch(
          votesAPI.util.updateQueryData('getGlobalStats', undefined, (draft) => {
            draft[slug] = Math.max(0, (draft[slug] ?? 0) + delta);
          })
        );

        const patchUser = dispatch(
          votesAPI.util.updateQueryData('getMyVotes', userId, (draft) => {
            return hasVoted 
              ? draft.filter(s => s !== slug) 
              : [...draft, slug];
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
