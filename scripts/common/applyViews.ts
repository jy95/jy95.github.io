import { readdir, readFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import type { Database } from 'better-sqlite3';

const VIEWS_DIR = resolve(import.meta.dirname, '..', 'views');

export interface ViewDefinition {
  name: string;
  body: string;
}

/**
 * Extracts the canonical view name from a filename (e.g., "07_games_in_present.sql" -> "games_in_present")
 */
export function getViewName(filename: string): string {
  return basename(filename, '.sql').replace(/^\d+_/, '');
}

/**
 * Retrieves and numerically sorts all view SQL files in VIEWS_DIR.
 */
async function getSortedViewFiles(): Promise<string[]> {
  const entries = await readdir(VIEWS_DIR);
  return entries
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/**
 * Reads all SQL files in parallel and extracts their names and SQL content.
 */
async function loadViewDefinitions(files: string[]): Promise<ViewDefinition[]> {
  return Promise.all(
    files.map(async (file) => ({
      name: getViewName(file),
      body: (await readFile(resolve(VIEWS_DIR, file), 'utf-8')).trim(),
    }))
  );
}

/**
 * Executes DROP VIEW statements in reverse dependency order (e.g., 13 -> 01).
 */
function dropViews(db: Database, views: ViewDefinition[]): void {
  for (let i = views.length - 1; i >= 0; i--) {
    db.exec(`DROP VIEW IF EXISTS "${views[i].name}"`);
  }
}

/**
 * Executes CREATE VIEW statements in forward dependency order (e.g., 01 -> 13).
 */
function createViews(db: Database, views: ViewDefinition[]): void {
  for (let i = 0; i < views.length; i++) {
    db.exec(`CREATE VIEW "${views[i].name}" AS\n${views[i].body}`);
  }
}

/**
 * Main entry point: loads view definitions asynchronously and applies them inside a SQLite transaction.
 */
export async function applyViews(db: Database): Promise<void> {
  const files = await getSortedViewFiles();
  if (files.length === 0) return;

  const views = await loadViewDefinitions(files);

  const syncApply = db.transaction(() => {
    dropViews(db, views);
    createViews(db, views);
  });

  return syncApply();
}