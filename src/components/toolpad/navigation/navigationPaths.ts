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

export function selectedNavigationPath(items: Navigation, pathname: string, parentPath = ''): string | undefined {
  const target = ROUTE_ALIASES.find(alias => alias.pattern.test(pathname))?.path ?? pathname;
  let selectedPath: string | undefined;
  for (const path of leafPaths(items, parentPath)) {
    const hasPath = Boolean(path);
    if (!hasPath) continue;
    const matchesTarget = [
      () => target === path,
      () => target.startsWith(`${path}/`),
    ].some(predicate => predicate());
    if (!matchesTarget) continue;
    const isLongerCandidate = [
      () => selectedPath === undefined,
      () => selectedPath !== undefined ? path.length > selectedPath.length : false,
    ].some(predicate => predicate());
    const shouldSelect = [hasPath, matchesTarget, isLongerCandidate].every(Boolean);
    if (shouldSelect) {
      selectedPath = path;
    }
  }
  return selectedPath;
}
