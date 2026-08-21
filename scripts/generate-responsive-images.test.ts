import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { readFileMock } = vi.hoisted(() => ({
  readFileMock: vi.fn(),
}));

const { createReadStreamMock } = vi.hoisted(() => ({
  createReadStreamMock: vi.fn(),
}));

const { sharpMock, cloneMock, resizeMock, toFileMock } = vi.hoisted(() => {
  const toFileMock = vi.fn().mockResolvedValue({});
  const resizeMock = vi.fn(() => ({ toFile: toFileMock }));
  const cloneMock = vi.fn(() => ({ resize: resizeMock }));
  const sharpMock = vi.fn(() => ({ clone: cloneMock }));

  return { sharpMock, cloneMock, resizeMock, toFileMock };
});

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>();
  const mock = {
    ...actual,
    readFile: readFileMock,
  }

  return {
      ...mock,
      default: mock,
  };
});

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();

  return {
    ...actual,
    createReadStream: createReadStreamMock,
    default: {
      ...actual.default,
      createReadStream: createReadStreamMock,
    },
  };
});

vi.mock('sharp', () => ({
  default: sharpMock,
}));

describe('scripts/generate-responsive-images.ts', () => {
  const originalArgv = process.argv.slice();

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();

    readFileMock.mockReset();
    createReadStreamMock.mockReset();
    sharpMock.mockClear();
    cloneMock.mockClear();
    resizeMock.mockClear();
    toFileMock.mockClear();

    createReadStreamMock.mockImplementation(() => ({
      pipe: vi.fn(),
    }));

    readFileMock.mockImplementation(async (file) => {
      if (String(file).includes('tests.json')) {
        return JSON.stringify([
          {
            playlistId: 't1',
            coverFile: 'cover.webp',
            title: 'Test Game',
          },
        ]);
      }

      return JSON.stringify([
        {
          playlistId: 'g1',
          coverFile: 'cover.webp',
          title: 'Real Game',
        },
      ]);
    });

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv.slice();
    vi.restoreAllMocks();
  });

  it('generates responsive images for all games when no arguments are provided', async () => {
    process.argv = ['node', 'generate-responsive-images'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(toFileMock).toHaveBeenCalledTimes(6);
    });

    expect(createReadStreamMock).toHaveBeenCalledTimes(2);
    expect(sharpMock).toHaveBeenCalledTimes(2);

    expect(resizeMock).toHaveBeenCalledWith({
      width: 150,
      height: 150,
      fit: 'inside',
    });
    expect(resizeMock).toHaveBeenCalledWith({
      width: 200,
      height: 200,
      fit: 'inside',
    });
    expect(resizeMock).toHaveBeenCalledWith({
      width: 250,
      height: 250,
      fit: 'inside',
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('Resize all pictures ....');
    expect(consoleLogSpy).toHaveBeenCalledWith('Real Game - finished');
    expect(consoleLogSpy).toHaveBeenCalledWith('Test Game - finished');
  });

  it('generates responsive images for one game in singleGame mode', async () => {
    process.argv = [
      'node',
      'generate-responsive-images',
      'singleGame',
      'SINGLE_ID',
      'covers',
      'custom-cover.png',
    ];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(toFileMock).toHaveBeenCalledTimes(3);
    });

    expect(createReadStreamMock).toHaveBeenCalledTimes(1);
    expect(sharpMock).toHaveBeenCalledTimes(1);
    expect(createReadStreamMock).toHaveBeenCalledWith(
      expect.stringContaining('/public/covers/SINGLE_ID/custom-cover.png')
    );

    expect(resizeMock).toHaveBeenCalledWith({
      width: 150,
      height: 150,
      fit: 'inside',
    });
    expect(resizeMock).toHaveBeenCalledWith({
      width: 200,
      height: 200,
      fit: 'inside',
    });
    expect(resizeMock).toHaveBeenCalledWith({
      width: 250,
      height: 250,
      fit: 'inside',
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('Resize single game');
    expect(consoleLogSpy).toHaveBeenCalledWith('SINGLE_ID - finished');
  });

  it('logs an error and does not resize when singleGame has no game ID', async () => {
    process.argv = ['node', 'generate-responsive-images', 'singleGame'];

    await import('./generate-responsive-images');

    expect(toFileMock).not.toHaveBeenCalled();
    expect(createReadStreamMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error: gameId is required for singleGame mode.'
    );
  });

  it('generates responsive images for singleGame with default folder and icon', async () => {
    process.argv = ['node', 'generate-responsive-images', 'singleGame', 'DEFAULT_GAME'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(toFileMock).toHaveBeenCalledTimes(3);
    });

    expect(createReadStreamMock).toHaveBeenCalledTimes(1);
    expect(createReadStreamMock).toHaveBeenCalledWith(
      expect.stringContaining('/public/covers/DEFAULT_GAME/cover.jpg')
    );

    expect(consoleLogSpy).toHaveBeenCalledWith('Resize single game');
    expect(consoleLogSpy).toHaveBeenCalledWith('DEFAULT_GAME - finished');
  });

  it('handles errors during resizePicturesInFolder gracefully', async () => {
    const error = new Error('Sharp processing failed');
    toFileMock.mockRejectedValueOnce(error);

    process.argv = ['node', 'generate-responsive-images'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cannot generate responsive images')
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
  });

  it('handles errors during resizePicturesInSingleFolder gracefully', async () => {
    const error = new Error('File stream error');
    toFileMock.mockRejectedValueOnce(error);

    process.argv = [
      'node',
      'generate-responsive-images',
      'singleGame',
      'ERROR_GAME',
    ];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Cannot generate responsive images for ERROR_GAME'
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
  });

  it('processes multiple games in default mode', async () => {
    readFileMock.mockImplementation(async (file) => {
      if (String(file).includes('tests.json')) {
        return JSON.stringify([
          {
            playlistId: 't1',
            coverFile: 'cover.webp',
            title: 'Test Game 1',
          },
          {
            playlistId: 't2',
            coverFile: 'cover.webp',
            title: 'Test Game 2',
          },
        ]);
      }

      return JSON.stringify([
        {
          playlistId: 'g1',
          coverFile: 'cover.webp',
          title: 'Real Game 1',
        },
        {
          playlistId: 'g2',
          coverFile: 'cover.webp',
          title: 'Real Game 2',
        },
      ]);
    });

    process.argv = ['node', 'generate-responsive-images'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(toFileMock).toHaveBeenCalledTimes(12); // 4 games * 3 sizes
    });

    expect(createReadStreamMock).toHaveBeenCalledTimes(4);
    expect(sharpMock).toHaveBeenCalledTimes(4);

    expect(consoleLogSpy).toHaveBeenCalledWith('Real Game 1 - finished');
    expect(consoleLogSpy).toHaveBeenCalledWith('Real Game 2 - finished');
    expect(consoleLogSpy).toHaveBeenCalledWith('Test Game 1 - finished');
    expect(consoleLogSpy).toHaveBeenCalledWith('Test Game 2 - finished');
  });

  it('uses default cover file when coverFile is not specified', async () => {
    readFileMock.mockImplementation(async (file) => {
      if (String(file).includes('tests.json')) {
        return JSON.stringify([
          {
            videoId: 't1',
            title: 'Test Without Cover',
          },
        ]);
      }

      return JSON.stringify([]);
    });

    process.argv = ['node', 'generate-responsive-images'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(createReadStreamMock).toHaveBeenCalled();
    });

    expect(createReadStreamMock).toHaveBeenCalledWith(
      expect.stringContaining('/cover.webp')
    );
  });

  it('uses videoId as fallback when playlistId is not specified', async () => {
    readFileMock.mockImplementation(async (file) => {
      if (String(file).includes('tests.json')) {
        return JSON.stringify([
          {
            videoId: 'video123',
            coverFile: 'cover.webp',
            title: 'Video Only',
          },
        ]);
      }

      return JSON.stringify([]);
    });

    process.argv = ['node', 'generate-responsive-images'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(createReadStreamMock).toHaveBeenCalled();
    });

    expect(createReadStreamMock).toHaveBeenCalledWith(
      expect.stringContaining('/video123/')
    );
  });

  it('generates webp files for all three sizes', async () => {
    process.argv = ['node', 'generate-responsive-images'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(toFileMock).toHaveBeenCalled();
    });

    const callArgs = toFileMock.mock.calls.map((call) => call[0]);
    
    expect(callArgs.some((arg) => arg.includes('cover@small.webp'))).toBe(true);
    expect(callArgs.some((arg) => arg.includes('cover@medium.webp'))).toBe(true);
    expect(callArgs.some((arg) => arg.includes('cover@big.webp'))).toBe(true);
  });

  it('logs appropriate message for default mode', async () => {
    process.argv = ['node', 'generate-responsive-images'];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Resize all pictures ....');
    });
  });

  it('handles singleGame with custom folder parameter', async () => {
    process.argv = [
      'node',
      'generate-responsive-images',
      'singleGame',
      'MY_GAME',
      'customfolder',
    ];

    await import('./generate-responsive-images');

    await vi.waitFor(() => {
      expect(createReadStreamMock).toHaveBeenCalled();
    });

    expect(createReadStreamMock).toHaveBeenCalledWith(
      expect.stringContaining('/public/customfolder/MY_GAME/')
    );
  });
});
