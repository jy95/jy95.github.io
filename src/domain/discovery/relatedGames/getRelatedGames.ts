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

function buildScoringContext(  
  target: CardGame,  
  options: RelatedGamesOptions,  
  candidateBigrams: ReadonlyMap<string, string[]>  
): ScoringContext {  
  const { seriesMap = {}, tierMap = {} } = options;
  const weights: RelatedGamesWeights = {  
    ...DEFAULT_WEIGHTS,  
    ...options.weights,  
    tier: { ...DEFAULT_WEIGHTS.tier, ...options.weights?.tier },  
  };  

  return {  
    target,  
    targetSeries: seriesMap[target.id],  
    targetGenres: new Set(target.genres ?? []),  
    targetDurationSeconds: target.duration ? timeToSeconds(target.duration) : undefined,  
    targetTitleBigrams: titleBigrams(target.title),  
    seriesMap,  
    tierMap,  
    weights,  
    candidateBigrams,  
  };  
}  

function keepBestScorePerGame(scores: RelatedGameResult[]): RelatedGameResult[] {
  const byId = new Map<string, RelatedGameResult>();
  for (const score of scores) {
    const existing = byId.get(score.id);
    if (!existing || compareRelatedGames(score, existing) < 0) {
      byId.set(score.id, score);
    }
  }
  return [...byId.values()];
}

function rankCandidates(  
  target: CardGame,  
  candidates: CardGame[],  
  context: ScoringContext,  
  limit: number  
): RelatedGameResult[] {  
  const scores = candidates
    .filter(c => c.id !== target.id)
    .map(c => scoreCandidate(c, context))
    .filter((s): s is RelatedGameResult => s !== null);

  return keepBestScorePerGame(scores)
    .sort(compareRelatedGames)
    .slice(0, Math.max(0, Math.trunc(limit) || 0));
}  

export function getRelatedGames(  
  target: CardGame,  
  candidates: CardGame[] | CandidateIndex,  
  options: RelatedGamesOptions = {}  
): RelatedGameResult[] {  
  const index = Array.isArray(candidates) ? buildCandidateIndex(candidates) : candidates;  
  const context = buildScoringContext(target, options, index.bigramsById);
  return rankCandidates(target, index.candidates, context, options.limit ?? 3);  
}
