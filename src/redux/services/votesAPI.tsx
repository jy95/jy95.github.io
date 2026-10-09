import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from "@/lib/supabase/client";
import { api } from "./api";

const supabase = createClient();

// --- UTILS: Zero-complexity wrappers ---
const wrapError = (msg: string): FetchBaseQueryError => ({ status: 'CUSTOM_ERROR', error: msg });

async function execute<T>(promise: Promise<{ data: T | null; error: any }>) {
  const { data, error } = await promise;
  return error ? { error: wrapError(error.message) } : { data };
}

// --- SERVICE: Pure Supabase Logic (Easily testable/maintainable) ---
const votesService = {
  fetchStats: () => supabase.from('games_stats').select('game_slug, likes_count'),
  fetchUserVotes: (userId: string) => supabase.from('games_likes').select('game_slug').eq('user_id', userId),
  updateVote: (slug: string, userId: string, hasVoted: boolean) => {
    const query = supabase.from('games_likes');
    return hasVoted ? query.delete().match({ game_slug: slug, user_id: userId }) 
                    : query.insert({ game_slug: slug, user_id: userId });
  }
};

// --- CACHE HELPERS: Decoupled state logic ---
const updateVoteCache = {
  stats: (draft: Record<string, number>, slug: string, delta: number) => {
    draft[slug] = Math.max(0, (draft[slug] ?? 0) + delta);
  },
  user: (draft: string[], slug: string, hasVoted: boolean) => {
    return hasVoted ? draft.filter(s => s !== slug) : [...draft, slug];
  }
};

export const votesAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      async queryFn() {
        const { data } = await execute(votesService.fetchStats());
        return { data: Object.fromEntries(data?.map(r => [r.game_slug, r.likes_count]) ?? []) };
      },
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      async queryFn(userId) {
        if (!userId) return { data: [] };
        const { data } = await execute(votesService.fetchUserVotes(userId));
        return { data: data?.map(v => v.game_slug) ?? [] };
      },
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, { slug: string; userId: string; hasVoted: boolean }>({
      async queryFn({ slug, userId, hasVoted }) {
        const { error } = await execute(votesService.updateVote(slug, userId, hasVoted));
        return error ? { error } : { data: undefined };
      },

      async onQueryStarted({ slug, userId, hasVoted }, { dispatch, queryFulfilled }) {
        const patchStats = dispatch(votesAPI.util.updateQueryData('getGlobalStats', undefined, (d) => 
          updateVoteCache.stats(d, slug, hasVoted ? -1 : 1)
        ));
        const patchUser = dispatch(votesAPI.util.updateQueryData('getMyVotes', userId, (d) => 
          updateVoteCache.user(d, slug, hasVoted)
        ));

        try { await queryFulfilled; } catch { 
          patchStats.undo(); 
          patchUser.undo(); 
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } = votesAPI;
