import { useEffect, useState } from 'react';
import { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } from '@/redux/services/votesAPI';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/** Authentication, vote queries and mutation ownership for game details. */
export function useGameVote(slug: string) {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: stats } = useGetGlobalStatsQuery();
  const { data: myVotes } = useGetMyVotesQuery(userId, { skip: !userId });
  const [toggle, { isLoading }] = useToggleVoteMutation();

  const count = stats?.[slug] ?? 0;
  const hasVoted = Boolean(myVotes?.includes(slug));

  const handleAction = () => {
    if (!userId) {
      return supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href },
      });
    }
    toggle({ slug, userId, hasVoted });
  };

  return { count, hasVoted, isLoading, handleAction };
}