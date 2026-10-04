import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// These callback contracts belong to the client graphs rooted below. Keep this
// focused list in sync when moving a component across a server boundary.
// Pre-edit audit at ba07a7156e74fd55aa1e5cc652569f84c8497e32:
// all 21 children were redundant entry points; no ordinary server-created
// callback crossing was confirmed. GameToolbar.tsx, LoadingButton.tsx and
// QueryBoundary.tsx already inherit client ownership. DashboardAppProvider.tsx
// passes an imported Client Component reference through its toolbar slot.
const clientChildren = [
    "src/app/[locale]/games/_client/GamesFilters.tsx",
    "src/app/[locale]/companies/_client/RoleToggle.tsx",
    "src/features/selection/components/grid/SelectionFilters.tsx",
    "src/features/selection/components/grid/SelectionCards.tsx",
    "src/features/selection/components/grid/SelectionCard.tsx",
    "src/features/selection/components/grid/SelectionGrid.tsx",
    "src/features/games/detail/GameDetailView.tsx",
    "src/features/games/components/SortSelect.tsx",
    "src/features/games/components/ReleaseDateFilter.tsx",
    "src/features/games/components/BaseCard.tsx",
    "src/features/games/components/PlatformSelect.tsx",
    "src/features/games/components/TitleFilter.tsx",
    "src/features/games/components/GenresSelect.tsx",
    "src/components/tierList/TierListControls.tsx",
    "src/components/tierList/TierRow.tsx",
    "src/components/tierList/TierListBoard.tsx",
    "src/components/tierList/GamesRow.tsx",
    "src/components/tierList/TierLists.tsx",
    "src/components/common/QueryErrorState.tsx",
    "src/components/common/ResponsiveSelect.tsx",
    "src/components/toolpad/navigation/NavigationItem.tsx"
];
const clientEntries = [
    "src/features/selection/components/SelectionPageLoader.tsx",
    "src/features/selection/components/SelectionPage.tsx",
    "src/app/[locale]/games/page.tsx",
    "src/app/[locale]/companies/page.tsx",
    "src/app/[locale]/tier/backlog/page.tsx",
    "src/app/[locale]/tier/games/page.tsx",
    "src/app/[locale]/tier/tests/page.tsx",
    "src/components/common/GameDataGrid.tsx",
    "src/components/toolpad/navigation/NavigationGroup.tsx"
];

const source = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');
const hasClientDirective = (file: string) => /^\s*['"]use client['"];/.test(source(file));

it.each(clientChildren)('keeps callback-bearing child %s inside its parent client graph', file => {
    expect(hasClientDirective(file)).toBe(false);
});

it.each(clientEntries)('preserves the interactive client entry %s', file => {
    expect(hasClientDirective(file)).toBe(true);
});

it.each(['src/app/[locale]/layout.tsx', 'src/app/[locale]/selection/page.tsx', 'src/components/dashboard/DashboardAppProvider.tsx'])('preserves server setup in %s', file => {
    expect(hasClientDirective(file)).toBe(false);
});
