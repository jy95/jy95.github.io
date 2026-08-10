"use client";

import { useRouter } from '@/i18n/routing';
import type { RandomAnswer } from "@/app/api/random/route";

/**
 * useNavigateToRandomGame
 * - Centralizes the logic that fetches /api/random and navigates accordingly.
 * - Returns an async function you can call from click handlers or effects.
 * - Returns an object with success/error state to allow consumers to handle failures.
 */
export default function useNavigateToRandomGame() {
  const router = useRouter();

  return async function navigateToRandomGame(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/random');

      if (!response.ok) {
        return { success: false, error: `HTTP error: ${response.status}` };
      }

      const data = (await response.json()) as RandomAnswer;

      // Validate response data
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid response format' };
      }

      if (data.type !== 'PLAYLIST' && data.type !== 'VIDEO') {
        return { success: false, error: `Unsupported type: ${data.type}` };
      }

      if (!data.identifier || typeof data.identifier !== 'string') {
        return { success: false, error: 'Missing or invalid identifier' };
      }

      // Navigate to the game
      router.push({
        pathname: data.type === "PLAYLIST" ? "/playlist/[id]" : "/video/[id]",
        params: { id: data.identifier }
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
}
