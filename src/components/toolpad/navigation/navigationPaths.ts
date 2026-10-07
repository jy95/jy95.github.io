import type { Navigation, NavigationItem } from '../types';

const ROUTE_ALIASES = [
  { pattern: /^\/games\/detail\/[^/]+\/?$/, path: '/games' },
  { pattern: /^\/(video|playlist)\/[^/]+\/?$/, path: '/games' },
  { pattern: /^\/companies\/[^/]+\/?$/, path: '/companies' },
  { pattern: /^\/games\/series\/[^/]+\/?$/, path: '/games/series' },
];

export function resolveNavigationPath(item: NavigationItem, parentPath = ''): string {
  return item.path ?? (item.segment ? `${parentPath}/${item.segment}` : parentPath);
}

export function navigationKey(item: NavigationItem, parentPath = ''): string {
  if (item.kind === 'group') return `group:${item.id}`;
  if (item.kind === 'section') return `section:${item.titleKey}`;
  return `${resolveNavigationPath(item, parentPath)}:${item.titleKey}`;
}

export function leafPaths(items: Navigation, parentPath = ''): string[] {
  return items.flatMap(item => {
    if (item.kind === 'section') return [];
    const path = resolveNavigationPath(item, parentPath);
    return item.children?.length ? leafPaths(item.children, path) : [path];
  });
}

const resolveRouteAlias = (pathname: string): string =>
  ROUTE_ALIASES.find(alias => alias.pattern.test(pathname))?.path ?? pathname;

const matchesTarget = (path: string, target: string): boolean =>
  target === path || target.startsWith(`${path}/`);

export function selectedNavigationPath(
  items: Navigation,
  pathname: string,
  parentPath = '',
): string | undefined {
  const target = resolveRouteAlias(pathname);

  return leafPaths(items, parentPath)
    .filter(path => path !== '' && matchesTarget(path, target))
    .reduce<string | undefined>(
      (best, path) => best === undefined || path.length > best.length ? path : best,
      undefined,
    );
}
