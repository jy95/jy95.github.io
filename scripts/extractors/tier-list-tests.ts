import type { Database } from "better-sqlite3";
import type { RawGame, CardGame } from "@/domain/games";
import { buildCardEntry } from "@/domain/games";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import { extractAndSaveTierList } from "./common/tierListExtractor";

type TierListTestsEntry = RawGame & {
  category_slug: string;
};

const TESTS_QUERY = `
  SELECT t.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug 
  FROM tests t  
  LEFT JOIN tier_list_tests tlt ON t.id = tlt.test_id
  LEFT JOIN tier_categories tc ON tlt.category_id = tc.id 
  ORDER BY t.title ASC
`;

export async function extractAndSaveTierListTests(db: Database, outputPath: string): Promise<void> {
  return extractAndSaveTierList<TierListTestsEntry, CardGame>(
    db,
    outputPath,
    TESTS_QUERY,
    (entry) => {
      const { category_slug: _, ...game } = entry;
      return {
        ...game,
        ...buildCardEntry(game, COVER_PATHS.tests),
      };
    }
  );
}