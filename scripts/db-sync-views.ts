import { applyViews } from "./common/applyViews";
import { openDatabase } from './common/db';

async function main(): Promise<void> {
  const db = openDatabase();
  try {
    console.log('🔄 Syncing SQLite views from db/views/...');
    await applyViews(db);
    console.log('✅ Views updated successfully.');
  } catch (error) {
    console.error('❌ Failed to sync views:', error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

await main();