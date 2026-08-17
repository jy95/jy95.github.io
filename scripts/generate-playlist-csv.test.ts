import { beforeEach, describe, expect, it, vi } from 'vitest';

// Declare hoisted mock functions so they can be referenced inside vi.mock factories
const {
  mockReadFile,
  mockFetchGamesWithPlaylists,
  mockReportsQuery,
  mockCreateWriteStream,
  mockInput
} = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockFetchGamesWithPlaylists: vi.fn(),
  mockReportsQuery: vi.fn(),
  mockCreateWriteStream: vi.fn(),
  mockInput: vi.fn()
}));

// Provide both default and named exports for Node built-ins
vi.mock('fs/promises', () => ({
  default: { readFile: mockReadFile },
  readFile: mockReadFile
}));

vi.mock('fs', () => ({
  default: { createWriteStream: mockCreateWriteStream },
  createWriteStream: mockCreateWriteStream
}));

vi.mock('@inquirer/input', () => ({
  default: mockInput
}));

vi.mock('../scripts/findPublishedGames', () => ({
  fetchGamesWithPlaylists: mockFetchGamesWithPlaylists
}));

// Use standard functions for constructors instantiated with 'new'
vi.mock('better-sqlite3', () => ({
  default: vi.fn().mockImplementation(function () {
    return { close: vi.fn() };
  })
}));

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(function () {
        return {
          generateAuthUrl: () => 'http://auth',
          getToken: (_code: string, cb: any) => cb(null, { access_token: 'a' }),
          setCredentials: vi.fn()
        };
      })
    },
    youtubeAnalytics: () => ({ reports: { query: mockReportsQuery } })
  }
}));

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

  mockReadFile.mockResolvedValue(
    JSON.stringify({
      installed: {
        client_secret: 'secret',
        client_id: 'id',
        redirect_uris: ['urn:ietf:wg:oauth:2.0:oob']
      }
    })
  );

  mockInput.mockResolvedValue('fake-code');

  mockCreateWriteStream.mockImplementation(() => {
    const chunks: string[] = [];
    return {
      write: (s: string) => chunks.push(s),
      end: (cb?: () => void) => {
        if (cb) cb();
        createStreamDone();
      },
      __getContents: () => chunks.join('')
    } as any;
  });
});

describe('generate-playlist-csv script', () => {
  it('writes CSV when playlists are returned and rows exist', async () => {
    mockFetchGamesWithPlaylists.mockReturnValue([
      { identifier: 'PL123', title: 'My "Awesome" Playlist' }
    ]);

    mockReportsQuery.mockImplementation(async () => {
      queryCalledResolve();
      return { data: { rows: [['PL123', 42, 84]] } };
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../scripts/generate-playlist-csv');

    await queryCalledPromise;
    await createStreamPromise;

    expect(logSpy).toHaveBeenCalled();
    expect(
      logSpy.mock.calls.some((call) => call[0] && call[0].toString().includes('http'))
    ).toBe(true);
    expect(
      logSpy.mock.calls.some(
        (call) => call[0] === 'Data written to playlists_stats.csv successfully.'
      )
    ).toBe(true);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('runs query without global filter when no playlists are returned and logs no data', async () => {
    mockFetchGamesWithPlaylists.mockReturnValue([]);

    mockReportsQuery.mockImplementation(async () => {
      queryCalledResolve();
      return { data: { rows: [] } };
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../scripts/generate-playlist-csv');

    await queryCalledPromise;

    expect(
      logSpy.mock.calls.some(
        (call) => call[0] && call[0].toString().includes('Aucune playlist')
      ) || logSpy.mock.calls.some((call) => call[0] === 'No data found.')
    ).toBeTruthy();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
