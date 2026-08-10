import type { AppConfig } from 'next-intl';

/**
 * Keys of the `TierList.categories` message namespace, e.g. "tier_good".
 * Shared between the tierListAPI service, the categories API route, and
 * every component rendering a tier category label — so nothing has to fall
 * back to `as any` to call `useTranslations("TierList.categories")(key)`.
 */
export type TierCategoryKey = keyof AppConfig["Messages"]["TierList"]["categories"];