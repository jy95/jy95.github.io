import { beforeEach, describe, expect, it, vi } from 'vitest';

// We'll mock all external modules used by the script BEFORE importing it.
let createStreamDone: () => void;
let createStreamPromise: Promise<void>;
let queryCalledResolve: () => void;
let queryCalledPromise: Promise<void>;

beforeEach(() => {
  vi.resetModules();

  createStreamPromise = new Promise<void>((res) => {
    createStreamDone = res;
  });
  queryCalledPromise = new Promise<void>((res) => {
    queryCalledResolve = res;
  });
});

describe('generate-playlist-csv script', () => {
  it('writes CSV when playlists are returned and rows exist', async () => {
    // Mock readFile to return minimal client secret JSON
    vi.mock('fs/promises', () => ({
      readFile: vi.fn().mockResolvedValue(
        JSON.stringify({
          installed: {
            client_secret: 'secret',
            client_id: 'id',
            redirect_uris: ['urn:ietf:wg:oauth:2.0:oob']
          }
        })
      )
    }));

    // Mock inquirer input to return a fake code
    vi.mock('@inquirer/input', () => ({ default: vi.fn().mockResolvedValue('fake-code') }));

    // Mock findPublishedGames to return one game with a playlist id
    vi.mock('../scripts/findPublishedGames', () => ({
      fetchGamesWithPlaylists: vi.fn().mockReturnValue([
        { identifier: 'PL123', title: 'My "Awesome" Playlist' }
      ])
    }));

    // Mock better-sqlite3 Database so it doesn't touch filesystem
    vi.mock('better-sqlite3', () => ({ default: vi.fn().mockImplementation(() => ({ close: vi.fn() })) }));

    // Mock googleapis
    vi.mock('googleapis', () => {
      const reportsQuery = vi.fn().mockImplementation(async (opts) => {
        // signal that the query was called
        queryCalledResolve();
        return { data: { rows: [['PL123', 42, 84]] } };
      });

      return {
        google: {
          auth: {
            OAuth2: vi.fn().mockImplementation(() => ({
              generateAuthUrl: () => 'http://auth',
              getToken: (_code: string, cb: any) => cb(null, { access_token: 'a' }) ,
              setCredentials: vi.fn()
            }))
          },
          youtubeAnalytics: () => ({ reports: { query: reportsQuery } })
        }
      };
    });

    // Mock createWriteStream to capture writes and resolve when end is called
    vi.mock('fs', async () => {
      // Lazy import original for other things if needed
      return {
        createWriteStream: vi.fn().mockImplementation(() => {
          const chunks: string[] = [];
          return {
            write: (s: string) => chunks.push(s),
            end: (cb?: () => void) => {
              // emulate async flush
              if (cb) cb();
              createStreamDone();
            },
            // expose for inspection via a property (not used by script directly)
            __getContents: () => chunks.join('')
          } as any;
        })
      };
    });

    // Spy on console.log so we can assert messages were printed
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Import the module (this will run the top-level code with our mocks)
    await import('../scripts/generate-playlist-csv');

    // Wait for the query to be called and for the stream to finish
    await queryCalledPromise;
    await createStreamPromise;

    // Assert that auth url was printed and that final success message was printed
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls.some(call => call[0] && call[0].toString().includes('http'))).toBe(true);
    expect(logSpy.mock.calls.some(call => call[0] === 'Data written to playlists_stats.csv successfully.')).toBe(true);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('runs query without global filter when no playlists are returned and logs no data', async () => {
    // Mock readFile again
    vi.mock('fs/promises', () => ({
      readFile: vi.fn().mockResolvedValue(
        JSON.stringify({
          installed: {
            client_secret: 'secret',
            client_id: 'id',
            redirect_uris: ['urn:ietf:wg:oauth:2.0:oob']
          }
        })
      )
    }));

    vi.mock('@inquirer/input', () => ({ default: vi.fn().mockResolvedValue('fake-code') }));

    // Now mock findPublishedGames to return an empty array
    vi.mock('../scripts/findPublishedGames', () => ({
      fetchGamesWithPlaylists: vi.fn().mockReturnValue([])
    }));

    vi.mock('better-sqlite3', () => ({ default: vi.fn().mockImplementation(() => ({ close: vi.fn() })) }));

    // Mock googleapis to return no rows
    vi.mock('googleapis', () => {
      const reportsQuery = vi.fn().mockImplementation(async (opts) => {
        queryCalledResolve();
        return { data: { rows: [] } };
      });

      return {
        google: {
          auth: {
            OAuth2: vi.fn().mockImplementation(() => ({
              generateAuthUrl: () => 'http://auth',
              getToken: (_code: string, cb: any) => cb(null, { access_token: 'a' }) ,
              setCredentials: vi.fn()
            }))
          },
          youtubeAnalytics: () => ({ reports: { query: reportsQuery } })
        }
      };
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../scripts/generate-playlist-csv');

    await queryCalledPromise;

    // Expect a message saying no playlists found for year and/or No data found
    expect(logSpy.mock.calls.some(call => call[0] && call[0].toString().includes('Aucune playlist')) || logSpy.mock.calls.some(call => call[0] === 'No data found.')).toBeTruthy();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
