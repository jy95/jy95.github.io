import { describe, expect, it } from 'vitest';
import NavigationMenu from '@/components/dashboard/MenuEntries';
import { leafPaths, navigationKey, resolveNavigationPath, selectedNavigationPath } from './navigationPaths';

describe('navigation paths', () => {
  it('traverses relative groups, excludes sections and preserves keys', () => {
    const section = { kind: 'section', titleKey: 'sections.browse' } as const;
    const child = { titleKey: 'gamesKey', segment: 'games' } as const;
    const group = { titleKey: 'tierTabs', segment: 'tier', children: [section, child] } as const;
    const navigation = [{ ...group, children: [...group.children] }];
    expect(leafPaths(navigation)).toEqual(['/tier/games']);
    expect(selectedNavigationPath(navigation, '/tier/games/detail')).toBe('/tier/games');
    expect(navigationKey(section)).toBe('section:sections.browse');
    expect(navigationKey(child, '/tier')).toBe('/tier/games:gamesKey');
    expect(navigationKey(NavigationMenu()[0])).toBe('group:browse');
  });

  it('excludes empty paths and keeps the first equal-length match', () => {
    const navigation = [
      { titleKey: 'gamesKey', path: '' },
      { titleKey: 'gamesKey', path: '/games' },
      { titleKey: 'gamesTabs.grid', path: '/games' },
    ] as const;
    expect(selectedNavigationPath([...navigation], '/games')).toBe('/games');
    expect(selectedNavigationPath([...navigation], '/')).toBeUndefined();
    expect(selectedNavigationPath([], '/games')).toBeUndefined();
  });

  it('does not broaden aliases to deeper routes', () => {
    const navigation = [{ titleKey: 'gamesKey', path: '/games/detail' }] as const;
    expect(selectedNavigationPath([...navigation], '/games/detail/abc')).toBeUndefined();
    expect(selectedNavigationPath([...navigation], '/games/detail/abc/extra')).toBe('/games/detail');
  });

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
    ['/unrelated', undefined], ['/tier/gamesextra', undefined],
    ['/games/seriesextra', '/games'],
    ['/games/detail/abc/', '/games'], ['/video/abc/', '/games'],
    ['/playlist/abc/', '/games'], ['/companies/abc/', '/companies'],
    ['/games/series/abc/', '/games/series'],
  ])('selects one leaf for %s', (pathname, expected) => {
    expect(selectedNavigationPath(NavigationMenu(), pathname)).toBe(expected);
  });
});
