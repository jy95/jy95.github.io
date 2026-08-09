import type { Database } from 'better-sqlite3';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKLOG_COVERS_PATH = join(__dirname, '../../public/covers/backlogcovers');

/**
 * Retrieves all valid backlog IDs from the database
 */
function getValidBacklogIds(db: Database): Set<string> {
  const query = "SELECT id FROM backlog";
  const result = db.prepare(query).all() as Array<{ id: number }>;
  return new Set(result.map(row => row.id.toString()));
}

/**
 * Retrieves all existing image folders in the backlog covers directory
 */
async function getExistingImageFolders(): Promise<string[]> {
  try {
    const entries = await fs.readdir(BACKLOG_COVERS_PATH, { withFileTypes: true });
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  } catch (error) {
    console.warn(`Warning: Could not read backlog covers directory at ${BACKLOG_COVERS_PATH}`, error);
    return [];
  }
}

/**
 * Deletes a single orphaned image folder
 */
async function deleteOrphanedFolder(folderName: string): Promise<boolean> {
  const folderPath = join(BACKLOG_COVERS_PATH, folderName);
  try {
    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`✓ Deleted orphaned folder: ${folderName}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to delete folder ${folderName}:`, error);
    return false;
  }
}

/**
 * Removes backlog entries that exist in the games table
 */
function deleteOrphanedBacklogEntries(db: Database): number {
  const deleteStmt = db.prepare(
    "DELETE FROM backlog WHERE title IN (SELECT title FROM games)"
  );
  const result = deleteStmt.run();
  console.log(`✓ Deleted ${result.changes} backlog entries that exist in games table`);
  return result.changes;
}

/**
 * Removes image folders that no longer have corresponding backlog IDs in the database
 */
async function deleteOrphanedImageFolders(
  db: Database,
  validIds: Set<string>
): Promise<number> {
  const existingFolders = await getExistingImageFolders();
  let deletedCount = 0;

  for (const folderName of existingFolders) {
    if (!validIds.has(folderName)) {
      const deleted = await deleteOrphanedFolder(folderName);
      if (deleted) deletedCount++;
    }
  }

  if (deletedCount === 0) {
    console.log('✓ No orphaned image folders found');
  } else {
    console.log(`✓ Deleted ${deletedCount} orphaned image folder(s)`);
  }

  return deletedCount;
}

/**
 * Main cleanup function for backlog entries and associated images
 * 1. Removes backlog entries that match games in the games table
 * 2. Removes image folders that no longer have a backlog entry in the database
 */
export async function cleanBacklog(db: Database): Promise<void> {
  console.log('🧹 Starting backlog cleanup...\n');

  try {
    // Step 1: Delete orphaned backlog entries
    const deletedEntries = deleteOrphanedBacklogEntries(db);

    // Step 2: Get all valid backlog IDs
    const validIds = getValidBacklogIds(db);
    console.log(`📊 Found ${validIds.size} valid backlog entries\n`);

    // Step 3: Delete orphaned image folders
    const deletedFolders = await deleteOrphanedImageFolders(db, validIds);

    console.log(`\n✅ Cleanup complete! Deleted ${deletedEntries} entries and ${deletedFolders} image folder(s)`);
  } catch (error) {
    console.error('❌ Error during backlog cleanup:', error);
    throw error;
  }
}
