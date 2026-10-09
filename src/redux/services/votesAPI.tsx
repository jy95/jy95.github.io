import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createClient } from "@/lib/supabase/client";
import { api } from "./api"

const supabase = createClient();

// Constants - eliminates magic strings
const TABLES = { STATS: 'games_stats', LIKES: 'games_likes' } as const;
const FIELDS = { SLUG: 'game_slug', LIKES: 'likes_count', USER: 'user_id' } as const;

// Single error handler
const toError = (message: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

// Eliminate boilerplate with a query wrapper
const executeQuery = async <T,>(
  query: () => Promise<{ data: T | null; error: any }>
) => {
  const { data, error } = await query();
  return error ? { error: toError(error.message) } : { data: data! };
};

export const votesAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalStats: builder.query<Record<string, number>, void>({
      queryFn: () => executeQuery(async () => {
        const res = await supabase.from(TABLES.STATS).select(`${FIELDS.SLUG}, ${FIELDS.LIKES}`);
        return {
          data: Object.fromEntries(res.data?.map(r => [r[FIELDS.SLUG], r[FIELDS.LIKES]]) ?? []),
          error: res.error,
        };
      }),
      providesTags: ['Stats'],
    }),

    getMyVotes: builder.query<string[], string | undefined>({
      queryFn: (userId) => !userId
        ? Promise.resolve({ data: [] })
        : executeQuery(async () => {
            const res = await supabase
              .from(TABLES.LIKES)
              .select(FIELDS.SLUG)
              .eq(FIELDS.USER, userId);
            return { data: res.data?.map(v => v[FIELDS.SLUG]), error: res.error };
          }),
      providesTags: ['MyVotes'],
    }),

    toggleVote: builder.mutation<void, { slug: string; userId: string; hasVoted: boolean }>({
      queryFn: async ({ slug, userId, hasVoted }) => {
        const row = { [FIELDS.SLUG]: slug, [FIELDS.USER]: userId };
        const query = supabase.from(TABLES.LIKES)[hasVoted ? 'delete' : 'insert'];
        return executeQuery(() => query().match(row).then(res => ({ data: undefined, error: res.error })));
      },

      async onQueryStarted({ slug, hasVoted, userId }, { dispatch, queryFulfilled }) {
        const undo = [
          dispatch(votesAPI.util.updateQueryData('getGlobalStats', undefined, draft => {
            draft[slug] = Math.max(0, (draft[slug] ?? 0) + (hasVoted ? -1 : 1));
          })),
          dispatch(votesAPI.util.updateQueryData('getMyVotes', userId, draft =>
            hasVoted ? draft.filter(s => s !== slug) : [...draft, slug]
          )),
        ];

        try {
          await queryFulfilled;
        } catch {
          undo.forEach(u => u.undo());
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } = votesAPI;
