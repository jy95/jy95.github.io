import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Explicitly typing vi.fn() as generic functions resolves the TS2348 callable error
let mockReadFile: ReturnType<typeof vi.fn<(...args: any[]) => any>>;
let mockWriteFile: ReturnType<typeof vi.fn<(...args: any[]) => any>>;
let mockAccess: ReturnType<typeof vi.fn<(...args: any[]) => any>>;

beforeEach(() => {
  // Reset module registry so our mocks are applied fresh for each test
  vi.resetModules();

  mockReadFile = vi.fn();
  mockWriteFile = vi.fn();
  mockAccess = vi.fn();

  // Mock fs/promises before importing the module-under-test so the
  // top-level generateData() call inside the script uses our mocks.
  vi.mock('fs/promises', () => ({
    readFile: (...args: any[]) => mockReadFile(...args),
    writeFile: (...args: any[]) => mockWriteFile(...args),
    access: (...args: any[]) => mockAccess(...args),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('scripts/generate-playlists-stats.ts', () => {
  it('parses CSV with quoted fields and writes filtered JSON', async () => {
    // Prepare CSV with header + several rows
    const csv = [
      'playlistId,title,views,watchTimeInMinutes',
      'PL1,Simple Title,123,456',
      'PL2,"Title, with comma",200,300',
      'PL3,"Title with ""quoted"" words",150,250',
      'PL4,Incomplete', // should be ignored (less than 4 columns)
    ].join('\n');

    mockReadFile.mockResolvedValue(csv);

    // access resolves only for PL1 and PL3, rejects for others
    mockAccess.mockImplementation((path: string) => {
      if (
        String(path).includes('/covers/PL1/cover.webp') ||
        String(path).includes('/covers/PL3/cover.webp')
      ) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('not found'));
    });

    // Spy on console.log so we can assert skip messages
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Importing the script will run generateData() (top-level) which will
    // use our mocked fs/promises implementations
    await import('./generate-playlists-stats');

    // writeFile should have been called once
    expect(mockWriteFile).toHaveBeenCalledTimes(1);

    // First argument is the output file path, second is the JSON data
    const writtenJson = mockWriteFile.mock.calls[0][1];
    const parsed = JSON.parse(String(writtenJson));

    // We expected PL1 and PL3 to be included
    expect(parsed).toHaveLength(2);

    const ids = parsed.map((p: any) => p.id).sort();
    expect(ids).toEqual(['PL1', 'PL3']);

    // Check fields for PL1
    const pl1 = parsed.find((p: any) => p.id === 'PL1');
    expect(pl1.title).toBe('Simple Title');
    expect(pl1.views).toBe(123);
    expect(pl1.watchTimeInMinutes).toBe(456);
    expect(pl1.imagePath).toEqual(expect.stringContaining('/covers/PL1/cover.webp'));

    // Check that quotes were unescaped for PL3 title
    const pl3 = parsed.find((p: any) => p.id === 'PL3');
    expect(pl3.title).toBe('Title with "quoted" words');

    // Ensure a log was emitted for the playlist whose image didn't exist (PL2)
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Title, with comma is not a game - skipping')
    );

    logSpy.mockRestore();
  });

  it('handles an empty CSV gracefully and writes empty array', async () => {
    const csv = 'playlistId,title,views,watchTimeInMinutes\n';
    mockReadFile.mockResolvedValue(csv);

    // access should not be called, but just in case resolve
    mockAccess.mockResolvedValue(undefined);

    await import('./generate-playlists-stats');

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const writtenJson = mockWriteFile.mock.calls[0][1];
    const parsed = JSON.parse(String(writtenJson));
    expect(parsed).toEqual([]);
  });
});
