import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { openDatabaseMock, applyViewsMock, closeMock } = vi.hoisted(() => ({
  openDatabaseMock: vi.fn(),
  applyViewsMock: vi.fn(),
  closeMock: vi.fn(),
}));

vi.mock('./common/db', () => ({
  openDatabase: openDatabaseMock,
}));

vi.mock('./common/applyViews', () => ({
  applyViews: applyViewsMock,
}));

describe('db-sync-views', () => {
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.exitCode = undefined;

    openDatabaseMock.mockReturnValue({
      close: closeMock,
    });

    applyViewsMock.mockResolvedValue(undefined);

  });

  afterEach(() => {
    process.exitCode = originalExitCode;
  });

  it('should open the database, apply views, log success, and close the database', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    await import('./db-sync-views');

    expect(openDatabaseMock).toHaveBeenCalledOnce();
    expect(applyViewsMock).toHaveBeenCalledOnce();
    expect(applyViewsMock).toHaveBeenCalledWith(
      openDatabaseMock.mock.results[0].value,
    );

    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      '🔄 Syncing SQLite views from db/views/...',
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      '✅ Views updated successfully.',
    );

    expect(process.exitCode).toBeUndefined();
    expect(closeMock).toHaveBeenCalledOnce();

    logSpy.mockRestore();

  });

  it('should log the error, set exitCode to 1, and close the database when syncing fails', async () => {
    const error = new Error('Failed to apply views');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    applyViewsMock.mockRejectedValueOnce(error);

    await import('./db-sync-views');

    expect(openDatabaseMock).toHaveBeenCalledOnce();
    expect(applyViewsMock).toHaveBeenCalledOnce();
    expect(applyViewsMock).toHaveBeenCalledWith(
      openDatabaseMock.mock.results[0].value,
    );

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledWith(
      '❌ Failed to sync views:',
      error,
    );

    expect(process.exitCode).toBe(1);
    expect(closeMock).toHaveBeenCalledOnce();

    errorSpy.mockRestore();

  });

  it('should close the database even when syncing fails', async () => {
    applyViewsMock.mockRejectedValueOnce(new Error('Sync failed'));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    await import('./db-sync-views');

    expect(closeMock).toHaveBeenCalledOnce();

    errorSpy.mockRestore();

  });
});