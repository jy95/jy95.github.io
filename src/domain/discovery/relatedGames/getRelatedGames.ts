import { timeToSeconds } from "@/domain/games";  
import { scoreCandidate } from "./scoreCandidate";  
import { titleBigrams } from "./titleSimilarity";  
import { buildCandidateIndex } from "./candidateIndex";  
import { DEFAULT_WEIGHTS } from "./weights";  
import { compareRelatedGames } from "./compareRelatedGames";

import type { CardGame } from "@/domain/games";  
import type { CandidateIndex } from "./candidateIndex";  
import type { RelatedGameResult, RelatedGamesOptions, RelatedGamesWeights } from "./types";  
import type { ScoringContext } from "./scorers/types";  

// Helper: Merge weights with defaults
function mergeWeights(options: RelatedGamesOptions): RelatedGamesWeights {
  return {
    ...DEFAULT_WEIGHTS,
    ...options.weights,
    tier: { ...DEFAULT_WEIGHTS.tier, ...options.weights?.tier },
  };
}

// Helper: Build scoring context
function buildScoringContext(  
  target: CardGame,  
  options: RelatedGamesOptions,  
  candidateBigrams: ReadonlyMap<string, string[]>  
): ScoringContext {  
  const { seriesMap = {}, tierMap = {} } = options;
  
  return {  
    target,  
    targetSeries: seriesMap[target.id],  
    targetGenres: new Set(target.genres ?? []),  
    targetDurationSeconds: target.duration ? timeToSeconds(target.duration) : undefined,  
    targetTitleBigrams: titleBigrams(target.title),  
    seriesMap,  
    tierMap,  
    weights: mergeWeights(options),
    candidateBigrams,  
  };  
}  

// Helper: Score and deduplicate candidates
function rankCandidates(  
  target: CardGame,  
  candidates: CardGame[],  
  context: ScoringContext,  
  limit: number  
): RelatedGameResult[] {  
  const results = candidates
    .filter(c => c.id !== target.id)
    .reduce((map, candidate) => {
      const score = scoreCandidate(candidate, context);
      if (score) {
        const existing = map.get(candidate.id);
        if (!existing || compareRelatedGames(score, existing) < 0) {
          map.set(candidate.id, score);
        }
      }
      return map;
    }, new Map<string, RelatedGameResult>());

  const normalizedLimit = Math.max(0, Math.trunc(limit) || 0);
  return [...results.values()].sort(compareRelatedGames).slice(0, normalizedLimit);
}  

export function getRelatedGames(  
  target: CardGame,  
  candidates: CardGame[] | CandidateIndex,  
  options: RelatedGamesOptions = {}  
): RelatedGameResult[] {  
  const index = Array.isArray(candidates) ? buildCandidateIndex(candidates) : candidates;  
  return rankCandidates(
    target,
    index.candidates,
    buildScoringContext(target, options, index.bigramsById),
    options.limit ?? 3
  );
}
