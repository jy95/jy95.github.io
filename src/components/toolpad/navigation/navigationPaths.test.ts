import { describe, expect, it } from 'vitest';
import NavigationMenu from '@/components/dashboard/MenuEntries';
import { resolveNavigationPath, selectedNavigationPath } from './navigationPaths';

describe('navigation paths', () => {
  it('prefers absolute paths and joins relative segments', () => {
    expect(resolveNavigationPath({ titleKey: 'gamesKey', path: '/games', segment: 'ignored' }, '/tier')).toBe('/games');
    expect(resolveNavigationPath({ titleKey: 'gamesKey', segment: 'games' }, '/tier')).toBe('/tier/games');
  });
  it.each([
    ['/games/series', '/games/series'], ['/gamesbacklog', undefined],
    ['/games/detail/abc', '/games'], ['/games/detail/[id]', '/games'],
    ['/video/abc', '/games'], ['/video/[id]', '/games'],
    ['/playlist/abc', '/games'], ['/playlist/[id]', '/games'],
    ['/companies/abc', '/companies'], ['/companies/[id]', '/companies'],
    ['/games/series/abc', '/games/series'], ['/games/series/[id]', '/games/series'],
    ['/tier/games/details', '/tier/games'], ['/tier', undefined],
  ])('selects one leaf for %s', (pathname, expected) => {
    expect(selectedNavigationPath(NavigationMenu(), pathname)).toBe(expected);
  });
});
