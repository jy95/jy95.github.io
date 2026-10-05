import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from "@/lib/supabase/client";
import { api } from "./api"

const supabase = createClient();

type StatsRow = { game_slug: string; likes_count: number };
type VoteArgs = { slug: string; userId: string; hasVoted: boolean };

const fail = ({ message }: { message: string }): { error: FetchBaseQueryError } => ({
  error: { status: 'CUSTOM_ERROR', error: message },
});

/** Un-voting a game that has no counter yet is a no-op; otherwise the counter moves by one. */
function applyLikeDelta(draft: Record<string, number>, slug: string, hasVoted: boolean) {
  if (hasVoted && draft[slug] === undefined) return;
  draft[slug] = (draft[slug] ?? 0) + (hasVoted ? -1 : 1);
}

function writeVote({ slug, userId, hasVoted }: VoteArgs) {
  const likes = supabase.from('games_likes');
  const row = { game_slug: slug, user_id: userId };

  if (hasVoted) return likes.delete().match(row);
  return likes.insert(row);
}

export const votesAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('games_stats').select('game_slug, likes_count');
        if (error) return fail(error);

        return { data: Object.fromEntries(data.map((row: StatsRow) => [row.game_slug, row.likes_count])) };
      },
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      queryFn: async (userId) => {
        if (!userId) return { data: [] };

        const { data, error } = await supabase.from('games_likes').select('game_slug').eq('user_id', userId);
        if (error) return fail(error);

        return { data: data.map(vote => vote.game_slug) };
      },
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, VoteArgs>({
      queryFn: async (args) => {
        const { error } = await writeVote(args);
        return error ? fail(error) : { data: undefined };
      },

      // Optimistic update of both caches, rolled back if the write fails.
      async onQueryStarted({ slug, hasVoted, userId }, { dispatch, queryFulfilled }) {
        const patches = [
          dispatch(votesAPI.util.updateQueryData('getGlobalStats', undefined, (draft) => {
            applyLikeDelta(draft, slug, hasVoted);
          })),
          dispatch(votesAPI.util.updateQueryData('getMyVotes', userId, (draft) => {
            if (hasVoted) return draft.filter(votedSlug => votedSlug !== slug);
            draft.push(slug);
          })),
        ];

        try {
          await queryFulfilled;
        } catch {
          patches.forEach(patch => patch.undo());
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } = votesAPI;
