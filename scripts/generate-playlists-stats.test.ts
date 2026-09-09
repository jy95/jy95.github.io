import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReadFile, mockWriteFile, mockAccess } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn(),
  mockAccess: vi.fn(),
}));

vi.mock('node:fs/promises', () => {
  const fsMock = {
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    access: (...args: unknown[]) => mockAccess(...args),
  };

  return {
    ...fsMock,
    default: fsMock,
  };
});

beforeEach(() => {
  vi.resetModules();

  mockReadFile.mockReset();
  mockWriteFile.mockReset();
  mockAccess.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('scripts/generate-playlists-stats.ts', () => {
  it('parses CSV with quoted fields and writes filtered JSON', async () => {
    const csv = [
      'playlistId,title,views,watchTimeInMinutes',
      'PL1,Simple Title,123,456',
      'PL2,"Title, with comma",200,300',
      'PL3,"Title with ""quoted"" words",150,250',
      'PL4,Incomplete',
    ].join('\n');

    mockReadFile.mockResolvedValue(csv);

    mockAccess.mockImplementation((path: string) => {
      const normalizedPath = String(path).replaceAll('\\', '/');

      if (
        normalizedPath.includes('/covers/PL1/cover.webp') ||
        normalizedPath.includes('/covers/PL3/cover.webp')
      ) {
        return Promise.resolve();
      }

      return Promise.reject(new Error('not found'));
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('./generate-playlists-stats');

    expect(mockWriteFile).toHaveBeenCalledTimes(1);

    const writtenJson = mockWriteFile.mock.calls[0][1];
    const parsed = JSON.parse(String(writtenJson));

    expect(parsed).toHaveLength(2);

    const ids = parsed.map((playlist: { id: string }) => playlist.id).sort();

    expect(ids).toEqual(['PL1', 'PL3']);

    const pl1 = parsed.find(
      (playlist: { id: string }) => playlist.id === 'PL1',
    );

    expect(pl1.title).toBe('Simple Title');
    expect(pl1.views).toBe(123);
    expect(pl1.watchTimeInMinutes).toBe(456);

    const normalizedImagePath = String(pl1.imagePath).replaceAll('\\', '/');

    expect(normalizedImagePath).toContain('/covers/PL1/cover.webp');

    const pl3 = parsed.find(
      (playlist: { id: string }) => playlist.id === 'PL3',
    );

    expect(pl3.title).toBe('Title with "quoted" words');

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Title, with comma is not a game - skipping',
      ),
    );
  });

  it('handles an empty CSV gracefully and writes empty array', async () => {
    const csv = 'playlistId,title,views,watchTimeInMinutes\n';

    mockReadFile.mockResolvedValue(csv);
    mockAccess.mockResolvedValue(undefined);

    await import('./generate-playlists-stats');

    expect(mockWriteFile).toHaveBeenCalledTimes(1);

    const writtenJson = mockWriteFile.mock.calls[0][1];
    const parsed = JSON.parse(String(writtenJson));

    expect(parsed).toEqual([]);
  });
});