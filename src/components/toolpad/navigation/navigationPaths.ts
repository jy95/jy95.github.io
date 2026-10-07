import type { Navigation, NavigationItem } from '../types';

export function resolveNavigationPath(item: NavigationItem, parentPath = ''): string {
  return item.path ?? (item.segment ? `${parentPath}/${item.segment}` : parentPath);
}

export function navigationKey(item: NavigationItem, parentPath = ''): string {
  return item.kind === 'section' ? `section:${item.titleKey}` : `${resolveNavigationPath(item, parentPath)}:${item.titleKey}`;
}

export function leafPaths(items: Navigation, parentPath = ''): string[] {
  return items.flatMap(item => {
    if (item.kind === 'section') return [];
    const path = resolveNavigationPath(item, parentPath);
    return item.children?.length ? leafPaths(item.children, path) : [path];
  });
}

export function selectedNavigationPath(items: Navigation, pathname: string, parentPath = ''): string | undefined {
  const aliases = [
    { pattern: /^\/games\/detail\/[^/]+\/?$/, path: '/games' },
    { pattern: /^\/(video|playlist)\/[^/]+\/?$/, path: '/games' },
    { pattern: /^\/companies\/[^/]+\/?$/, path: '/companies' },
    { pattern: /^\/games\/series\/[^/]+\/?$/, path: '/games/series' },
  ];
  const target = aliases.find(alias => alias.pattern.test(pathname))?.path ?? pathname;
  return leafPaths(items, parentPath)
    .filter(path => path && (target === path || target.startsWith(`${path}/`)))
    .sort((a, b) => b.length - a.length)[0];
}
