import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notFound } from 'next/navigation';
import CatchAllPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('CatchAllPage', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockReset();
  });

  it('calls notFound() exactly once', () => {
    CatchAllPage();
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});