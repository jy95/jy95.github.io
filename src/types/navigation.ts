import type { AppConfig } from 'next-intl';

/**
 * Flattened dot-path keys for the `dashboard.menuEntries` message
 * namespace, e.g. "gamesKey" or "gamesTabs.grid". Used to type
 * `NavigationItem.titleKey` so a renamed/typo'd message key fails to
 * compile instead of silently rendering nothing in the sidebar.
 */
type MenuEntriesMessages = AppConfig['Messages']['dashboard']['menuEntries'];

type FlattenKeys<T, Prefix extends string = ""> = {
    [K in keyof T & string]: T[K] extends string
        ? `${Prefix}${K}`
        : FlattenKeys<T[K], `${Prefix}${K}.`>
}[keyof T & string];

export type DashboardMenuKey = FlattenKeys<MenuEntriesMessages>;