import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'node:fs/promises';
import { getViewName, applyViews } from './common/applyViews';
import { useExtractorHarness } from './extractors/common/extractorTestHarness';

vi.mock('node:fs/promises', () => {
  const readdirFn = vi.fn().mockResolvedValue([]);
  const readFileFn = vi.fn().mockResolvedValue('');

  return {
    default: {
      readdir: readdirFn,
      readFile: readFileFn,
    },
    readdir: readdirFn,
    readFile: readFileFn,
  };
});

/**
 * Drops all views from the test database to reset to a clean state.
 */
function dropAllViews(db: any): void {
  const views = db
    .prepare("SELECT name FROM sqlite_master WHERE type='view'")
    .all() as { name: string }[];

  for (const view of views) {
    db.exec(`DROP VIEW IF EXISTS "${view.name}"`);
  }
}

describe('db-sync-views', () => {
  describe('getViewName', () => {
    it('should strip numeric prefixes and .sql extension', () => {
      expect(getViewName('07_games_in_present.sql')).toBe('games_in_present');
      expect(getViewName('01_users.sql')).toBe('users');
      expect(getViewName('12_active_subscriptions.sql')).toBe('active_subscriptions');
    });

    it('should handle filenames without a numeric prefix', () => {
      expect(getViewName('custom_view.sql')).toBe('custom_view');
    });
  });

  describe('applyViews', () => {
    const ctx = useExtractorHarness('db-sync-views');

    beforeEach(() => {
      vi.clearAllMocks();
      // Reset mocks with default behavior (empty array / empty string)
      vi.mocked(fs.readdir).mockResolvedValue([] as any);
      vi.mocked(fs.readFile).mockResolvedValue('');
      dropAllViews(ctx.db);
    });

    it('should read, sort numerically, and apply views in correct dependency order', async () => {
      const mockFiles = ['10_view_b.sql', '01_view_a.sql', '02_view_c.sql'];

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
        const pathStr = String(filePath);
        if (pathStr.includes('01_view_a.sql')) return 'SELECT 1 AS col_a;';
        if (pathStr.includes('02_view_c.sql')) return 'SELECT col_a FROM view_a;';
        if (pathStr.includes('10_view_b.sql')) return 'SELECT col_a FROM view_c;';
        return '';
      });

      await applyViews(ctx.db);

      const viewsInDb = ctx.db
        .prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name")
        .all() as { name: string }[];

      expect(viewsInDb.map((v) => v.name)).toEqual(['view_a', 'view_b', 'view_c']);

      const result = ctx.db.prepare('SELECT * FROM view_b').all();
      expect(result).toEqual([{ col_a: 1 }]);
    });

    it('should drop existing views in reverse order before recreating them', async () => {
      ctx.db.exec('CREATE VIEW view_a AS SELECT 999 AS col_a');

      const mockFiles = ['01_view_a.sql'];
      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      vi.mocked(fs.readFile).mockResolvedValue('SELECT 42 AS col_a;');

      await applyViews(ctx.db);

      const result = ctx.db.prepare('SELECT * FROM view_a').all();
      expect(result).toEqual([{ col_a: 42 }]);
    });

    it('should execute inside a transaction and rollback on error', async () => {
      const mockFiles = ['01_valid_view.sql', '02_invalid_view.sql'];

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);
      vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
        const pathStr = String(filePath);
        if (pathStr.includes('01_valid_view.sql')) return 'SELECT 1 AS id;';
        if (pathStr.includes('02_invalid_view.sql')) return 'INVALID SQL STATEMENT;';
        return '';
      });

      await expect(applyViews(ctx.db)).rejects.toThrow();

      const viewsInDb = ctx.db
        .prepare("SELECT name FROM sqlite_master WHERE type='view'")
        .all();

      expect(viewsInDb).toHaveLength(0);
    });
  });
});