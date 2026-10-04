import { useEffect, useState } from 'react';
import { useGetGlobalStatsQuery, useGetMyVotesQuery, useToggleVoteMutation } from '@/redux/services/votesAPI';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/** Authentication, vote queries and mutation ownership for game details. */
export function useGameVote(slug: string) {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: stats } = useGetGlobalStatsQuery();
  const { data: myVotes } = useGetMyVotesQuery(userId, { skip: !userId });
  const [toggle, { isLoading }] = useToggleVoteMutation();

  const count = stats?.[slug] || 0;
  const hasVoted = myVotes?.includes(slug) || false;

  const handleAction = async () => {
    if (!userId) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
      return;
    }
    toggle({ slug, userId, hasVoted });
  };

  return { count, hasVoted, isLoading, handleAction };
}
