import { describe, it, expect } from 'vitest';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hasRealDb, openTestDb } from './tasks/testDbHelper';
import { getViewName } from './common/applyViews';

const VIEWS_DIR = resolve(import.meta.dirname, 'views');

describe.skipIf(!hasRealDb)('db-sync-views integration', () => {
  it('applies all view SQL files to the database and ensures they are queryable', async () => {
    // openTestDb() exécute déjà await applyViews(db) sur la copie temporaire
    const { db, cleanup } = await openTestDb();

    try {
      const files = (await readdir(VIEWS_DIR)).filter(f => f.endsWith('.sql'));
      expect(files.length).toBeGreaterThan(0);

      for (const file of files) {
        const viewName = getViewName(file);

        // 1. Vérifie que la vue existe dans sqlite_master
        const row = db
          .prepare("SELECT sql FROM sqlite_master WHERE type='view' AND name = ?")
          .get(viewName) as { sql: string } | undefined;

        expect(row, `View "${viewName}" was not created in sqlite_master`).toBeDefined();

        // 2. Vérifie que la vue s'exécute sans erreur SQL
        expect(() => {
          db.prepare(`SELECT * FROM "${viewName}" LIMIT 1`).all();
        }, `View "${viewName}" failed query execution`).not.toThrow();
      }
    } finally {
      cleanup();
    }
  });
});