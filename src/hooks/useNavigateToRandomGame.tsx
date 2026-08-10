"use client";

import { useRouter } from '@/i18n/routing';
import type { RandomAnswer } from "@/app/api/random/route";

/**
 * useNavigateToRandomGame
 * - Centralizes the logic that fetches /api/random and navigates accordingly.
 * - Returns an async function you can call from click handlers or effects.
 */
export default function useNavigateToRandomGame() {
  const router = useRouter();

  return async function navigateToRandomGame() {
    const response = await fetch('/api/random');
    const data = (await response.json()) as RandomAnswer;
    router.push({
      pathname: data.type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
      params: { id: data.identifier }
    });
  };
}
