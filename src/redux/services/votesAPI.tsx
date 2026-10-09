import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from "@/lib/supabase/client";
import { api } from "./api";

const supabase = createClient();

const supabaseError = (message: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

/**
 * 1. GENERIC SUPABASE HANDLER
 * Reduces complexity by handling all error checking and data extraction in one place.
 */
async function handleSupabaseQuery<T, R = void>(
  request: PromiseLike<{ data: T | null; error: any }>,
  transform?: (data: T) => R
) {
  const { data, error } = await request;
  if (error) return { error: supabaseError(error.message) };
  
  // Transform the data if a callback is provided, otherwise return as is
  return { data: (transform && data ? transform(data) : data) as R };
}

/**
 * 2. ISOLATED CACHE MUTATORS
 * Removes inline logic from the endpoints, making the complex optimistic updates easy to read.
 */
const applyStatsPatch = (draft: Record<string, number>, slug: string, hasVoted: boolean) => {
  draft[slug] = Math.max(0, (draft[slug] ?? 0) + (hasVoted ? -1 : 1));
};

const applyUserPatch = (draft: string[], slug: string, hasVoted: boolean) => {
  if (hasVoted) {
    return draft.filter((votedSlug) => votedSlug !== slug);
  }
  draft.push(slug); // Safely mutates thanks to RTK Query's built-in Immer
};

/**
 * 3. CLEANED UP API DEFINITION
 */
export const votesAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      queryFn: () =>
        handleSupabaseQuery(
          supabase.from('games_stats').select('game_slug, likes_count'),
          (data) => Object.fromEntries(data.map((row) => [row.game_slug, row.likes_count]))
        ),
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      queryFn: (userId) => {
        if (!userId) return { data: [] };
        
        return handleSupabaseQuery(
          supabase.from('games_likes').select('game_slug').eq('user_id', userId),
          (data) => data.map((vote) => vote.game_slug)
        );
      },
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, { slug: string; userId: string; hasVoted: boolean }>({
      queryFn: ({ slug, userId, hasVoted }) => {
        const likesDb = supabase.from('games_likes');
        const row = { game_slug: slug, user_id: userId };

        // Ternary resolves to the correct promise before passing to our wrapper
        return handleSupabaseQuery(
          hasVoted ? likesDb.delete().match(row) : likesDb.insert(row)
        );
      },

      async onQueryStarted({ slug, hasVoted, userId }, { dispatch, queryFulfilled }) {
        const patchStats = dispatch(
          votesAPI.util.updateQueryData('getGlobalStats', undefined, (draft) => 
            applyStatsPatch(draft, slug, hasVoted)
          )
        );
        
        const patchUser = dispatch(
          votesAPI.util.updateQueryData('getMyVotes', userId, (draft) => 
            applyUserPatch(draft, slug, hasVoted)
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
