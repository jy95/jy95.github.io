// Need to use the React-specific entry point to import createApi
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { createClient } from "@/lib/supabase/client";

// Prepare the supabase client with the necessary configuration
const supabase = createClient();

// Define a service using a base URL and expected endpoints
export const votesAPI = createApi({
  reducerPath: 'votesAPI',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Stats', 'MyVotes'],
  endpoints: (builder) => ({
    
    // 1. Récupération des compteurs (Via la table de stats gérée par trigger)
    getGlobalStats: builder.query<Record<string, number>, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('games_stats')
          .select('game_slug, likes_count');

        if (error) return { error: error.message };

        const stats = data.reduce((acc: any, curr: any) => {
          acc[curr.game_slug] = curr.likes_count;
          return acc;
        }, {});

        return { data: stats };
      },
      providesTags: ['Stats'],
    }),

    // 2. Récupération des votes de l'utilisateur connecté
    getMyVotes: builder.query<string[], string | undefined>({
      queryFn: async (userId) => {
        if (!userId) return { data: [] };
        const { data, error } = await supabase
          .from('games_likes')
          .select('game_slug')
          .eq('user_id', userId);

        if (error) return { error: error.message };
        return { data: data.map(v => v.game_slug) };
      },
      providesTags: ['MyVotes'],
    }),

    // 3. Mutation avec mise à jour optimiste (Zéro latence UI)
    toggleVote: builder.mutation<void, { slug: string; userId: string; hasVoted: boolean }>({
      queryFn: async ({ slug, userId, hasVoted }) => {
        if (hasVoted) {
          const { error } = await supabase
            .from('games_likes')
            .delete()
            .match({ game_slug: slug, user_id: userId });
          if (error) return { error: error.message };
        } else {
          const { error } = await supabase
            .from('games_likes')
            .insert({ game_slug: slug, user_id: userId });
          if (error) return { error: error.message };
        }
        return { data: undefined };
      },
      async onQueryStarted({ slug, hasVoted, userId }, { dispatch, queryFulfilled }) {
        // MAJ Optimiste du compteur global
        const patchStats = dispatch(
          votesAPI.util.updateQueryData('getGlobalStats', undefined, (draft) => {
            if (draft[slug] !== undefined) {
              draft[slug] += hasVoted ? -1 : 1;
            } else if (!hasVoted) draft[slug] = 1;
          })
        );

        // MAJ Optimiste des votes perso
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
});

export const { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } = votesAPI;
