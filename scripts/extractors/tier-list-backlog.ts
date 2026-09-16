import type { Database } from "better-sqlite3";
import type { BacklogEntry } from "@/app/api/backlog/route";
import { COVER_PATHS } from "@/domain/games/coverPaths";
import { extractAndSaveTierList } from "./common/tierListExtractor";

type TierListBacklogEntry = Omit<BacklogEntry, "imagePath" | "url" | "url_type"> & {
  category_slug: string;
};

const BACKLOG_QUERY = `
  SELECT b.*, COALESCE(tc.slug, 'tier_not_evaluated') AS category_slug
  FROM backlog b
  LEFT JOIN tier_list_backlog tlb ON b.id = tlb.backlog_id
  LEFT JOIN tier_categories tc ON tlb.category_id = tc.id 
  ORDER BY b.title ASC
`;

export async function extractAndSaveTierListBacklog(db: Database, outputPath: string): Promise<void> {
  return extractAndSaveTierList<TierListBacklogEntry, BacklogEntry>(
    db,
    outputPath,
    BACKLOG_QUERY,
    (entry) => {
      const { category_slug: _, ...backlogEntry } = entry;
      return {
        ...backlogEntry,
        id: String(backlogEntry.id),
        imagePath: `${COVER_PATHS.backlog}/${backlogEntry.id}/cover.webp`,
      };
    }
  );
}
