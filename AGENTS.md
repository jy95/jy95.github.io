# AGENTS.md

## Project overview

This repository is the GamesPassionFR Gaming Catalog: a bilingual (French/English) Next.js application used to organize and present games, backlog items, planned releases, tests, tiers, companies, statistics, playlists, and related video content.

Treat the repository as an established application, not a starter project. Preserve existing behavior, data contracts, UX conventions, and localization patterns unless the task explicitly requires a change.

## Technology

- Next.js with the App Router.
- React.
- TypeScript with `strict: true`.
- Material UI (MUI) for the UI and theming.
- `next-intl` for internationalization.
- Vitest + Testing Library + jsdom for tests.
- SQLite database and project JSON data/assets for catalog content.
- Fuse.js for fuzzy game search.
- `@/*` resolves to `src/*`.

## Important commands

```bash
npm run dev
npm run build
npm test
npm run test:coverage
npm run dev:test
```

Useful repository scripts include:

```bash
npm run generate-responsive-images
npm run generate-playlist-data-report
npm run generate-playlist-csv
npm run find-published-games
npm run generate-api-json-files
npm run db:sync-views
npm run analyze:company-duplicates
```

Do not invent new package scripts when an existing command already covers the task.

## Repository structure

Use the existing structure as the source of truth.

- `src/app/`: Next.js routes, layouts, route-level UI and APIs.
- `src/features/`: feature-oriented application code and reusable feature components.
- `src/test/`: shared test setup.
- `scripts/`: maintenance, data-generation and catalog-management scripts.
- `messages/`: localization messages.
- `public/`: static assets and generated/public catalog assets.
- `.github/`: GitHub Actions and repository automation.
- `GamesPassionFR.db`: local SQLite database used by the project.
- `vercel.json`: Vercel deployment rules.
- `next.config.ts`: Next.js and `next-intl` configuration.

Prefer placing new logic next to the feature that owns it instead of creating a new global utility folder.

## Architecture rules

### Next.js / React

- Follow the App Router architecture already used by the project.
- Keep components as Server Components by default.
- Add `'use client'` only when client-side state, effects, browser APIs, or event handlers are actually required.
- Do not move server-side data access into Client Components just to simplify props.
- Keep route components focused on composition; move substantial reusable logic into feature components or focused utilities.
- Preserve existing loading, error, empty-state, and not-found behavior.

### Feature boundaries

- Reuse existing feature components before creating a new generic component.
- Shared game-card behavior belongs in the existing card/component abstractions rather than being duplicated across pages.
- Avoid putting domain-specific logic into generic UI components.
- Keep data transformation separate from presentation when the transformation is non-trivial.
- Do not introduce a new abstraction merely to save a few lines. Prefer small, named functions with obvious responsibility.

### Complexity and file size

Readability and maintainability are first-class requirements.

- Do not add large monolithic components, pages, hooks, or utilities.
- Split code when a file contains multiple independent responsibilities.
- For a large feature, use a small folder of focused modules rather than one very large file.
- Prefer several simple functions over deeply nested conditionals, giant `switch` statements, or clever generic abstractions.
- Repeated domain patterns should be extracted into small, well-named helpers.
- Do not replace readable code with unnecessary loops, reducers, or indirection merely to appear abstract.
- Keep functions easy to test in isolation.
- When refactoring, preserve behavior first; reduce complexity second.

## TypeScript

- Keep TypeScript strictness intact.
- Avoid `any`, unsafe assertions, non-null assertions, and casts unless they are genuinely required and documented by the surrounding code.
- Handle `undefined` explicitly instead of passing `boolean | undefined`, `string | undefined`, etc. into APIs that require concrete values.
- Prefer accurate prop types and defaults over `as` casts.
- Use `import type` for type-only imports.
- Reuse existing domain types instead of creating subtly incompatible duplicates.
- Preserve the `@/*` alias for internal imports.

## Imports and formatting

Use a consistent import layout throughout the repository:

1. React / Next.js / third-party packages.
2. MUI and other library imports.
3. Internal absolute imports using `@/...`.
4. Relative imports.
5. Type-only imports kept explicit.

Within a group, keep imports stable and easy to scan. Do not perform unrelated import churn during a feature change.

Follow the existing ESLint configuration. Do not add formatter configuration or mass-format unrelated files.

## MUI and UI conventions

- Use MUI components and the existing theme instead of introducing another UI system.
- Reuse existing spacing, breakpoints, typography, cards, chips, toolbars, dialogs and responsive patterns.
- Respect both light and dark themes.
- Use `sx` and theme values consistently with surrounding components.
- Do not hardcode colors when the theme already provides an appropriate value.
- Preserve responsive behavior on mobile and desktop.
- For logos/company images, do not automatically reuse game-cover rendering behavior. Company artwork should be treated as logo/image content and use an appropriate fit such as `contain` when applicable.
- Keep clickable UI semantically clickable and keyboard accessible.

## Internationalization

The application is bilingual.

- All user-visible text must go through `next-intl` messages.
- Do not hardcode French or English UI strings in components.
- Use existing message namespaces and conventions before creating new ones.
- For values whose wording changes between one and many items, use the existing singular/plural message mechanism.
- Keep translation keys language-independent and descriptive.
- When adding a feature, update every locale that the application supports.
- Never use a locale-specific string as a business-logic identifier.

## Games/catalog domain rules

The catalog distinguishes different content states and types. Do not silently merge them.

- Published games are catalog content.
- Backlog entries are candidates that are not published.
- Planned items represent upcoming releases/content.
- DLCs are distinct catalog entries even when associated with a parent game.
- Tests/tier data are editorial content and should not be presented as objective external facts.
- The `/selection` feature stores selection identifiers and must preserve its versioned data format and backwards compatibility.

When resolving overlapping identifiers for selections, preserve the documented precedence:
published games > DLCs > planning.

### Companies

Companies represent developers and publishers associated with games.

- A game can have `developers?: string[]` and/or `publishers?: string[]` in the relevant catalog model.
- The relational `games_companies` data uses the company, game, and role (`developer` or `publisher`).
- Do not add platform information to `games_companies`; platform is already represented elsewhere in the catalog.
- Company pages should use the company-specific presentation rather than pretending company logos are game covers.
- Company links should use the existing `/companies/<id>` routing convention.

## Data and generated files

Treat catalog data as production-like content.

- Do not manually change generated JSON, images, reports, or derived database views when an existing generation script is responsible for them.
- First identify the source of truth and the generation path.
- Keep generated output deterministic.
- Do not commit temporary files, debug output, local caches, or ad-hoc exports.
- Preserve IDs and existing serialized formats unless the task explicitly changes the contract.
- When changing a data model, update all affected readers, writers, scripts, tests, and documentation.

## Database work

- Inspect the existing schema and queries before changing database-related code.
- Prefer the existing database helpers/access patterns.
- Do not add a new table when an existing relation or derived view already models the requirement.
- Preserve foreign-key relationships and existing identifier semantics.
- Avoid schema changes for UI-only requirements.
- If a schema change is required, update associated scripts/tests/documentation together.

## Scripts and maintenance code

The `scripts/` directory contains important project logic, not throwaway code.

- Keep scripts modular when they grow beyond a single responsibility.
- Reuse shared task utilities where appropriate.
- Keep CLI/data-processing code independently testable.
- Handle missing catalog entries explicitly and intentionally; do not assume every referenced entry exists.
- When processing collections of catalog data, define the behavior for missing, invalid, duplicate, or partially populated entries.
- Do not silently discard data unless that is the established behavior.
- Preserve clear output and useful error messages for automation.

## Testing

Tests are part of the implementation, not an afterthought.

- Run targeted tests for changed behavior.
- Add or update tests for meaningful logic changes and regression fixes.
- React UI tests should use Testing Library patterns consistent with the existing suite.
- Vitest runs in jsdom and loads `src/test/setup.ts`.
- Script tests may live under `scripts/**/*.test.ts`.
- Prefer testing public behavior and domain rules over implementation details.
- When refactoring without behavior changes, keep the existing test coverage passing.

Before considering a change complete, normally run:

```bash
npm test
npm run build
```

For a focused change, also run the smallest relevant test file or test pattern first.

## Accessibility and UX

- Preserve existing keyboard navigation and semantic elements.
- Buttons must remain buttons; links must remain links.
- Dialogs, menus, tooltips and interactive cards must remain usable without a mouse.
- Do not make visual-only changes that break focus handling or text alternatives.
- Preserve useful empty/loading/error states.

## Performance

- Prefer Server Components and server-side data loading where possible.
- Avoid unnecessary client state, effects, re-renders, or duplicated derived data.
- Do not repeatedly recompute expensive catalog transformations during render when they can be indexed or memoized appropriately.
- Avoid loading large datasets into the client unless the feature actually needs them.
- Use Next.js image handling and the project's responsive image conventions instead of ad-hoc image processing in components.

## Routing and navigation

- Follow the existing App Router route structure.
- Reuse existing navigation helpers/components.
- Preserve query parameters and shareable URLs when modifying selection/search/filter/sort behavior.
- For detail pages reached from a filtered/sorted result list, preserve the existing back-to-results UX where applicable.
- Do not introduce a separate router abstraction unless there is a concrete repository-wide need.

## Git and automation

- Treat `master` as the primary branch.
- Automated PR branches are intentionally separated from normal development branches.
- Current Vercel configuration disables deployments for `gh-pages`, `automated/*`, `dependabot/*`, and `coderabbitai/*`; do not casually change this behavior.
- Review GitHub Actions changes carefully because some workflows generate data and open pull requests automatically.
- Do not create a workflow that can recursively trigger itself without an explicit guard.
- Preserve existing automation branch naming, generated commit conventions, and PR labels unless the task asks to change them.

## Refactoring guidelines

When asked to refactor:

1. Identify the current behavior and all callers.
2. Preserve public APIs and data formats unless a change is explicitly requested.
3. Prefer small, composable functions over giant helpers.
4. Remove duplication only when the extracted abstraction is genuinely clearer.
5. Avoid speculative architecture changes.
6. Keep unrelated cleanup out of the same change.
7. Run tests and lint after structural changes.

A successful refactor should make the code easier to read, test, and modify without requiring the next developer to understand a new abstraction layer first.

## What agents should not do

- Do not rewrite a whole feature when a focused change is sufficient.
- Do not replace MUI with another component library.
- Do not introduce Redux/global state for local component state.
- Do not hardcode translations in UI components.
- Do not bypass existing domain helpers or data access without a reason.
- Do not modify generated files manually when a source/generator exists.
- Do not weaken TypeScript or ESLint rules to make an implementation pass.
- Do not silence tests or lint with broad disables.
- Do not add unnecessary dependencies.
- Do not change unrelated formatting across the repository.
- Do not assume missing data is impossible.
- Do not invent catalog facts when the repository does not contain them.

## Definition of done

A change is ready when:

- The implementation matches the existing architecture and UI conventions.
- TypeScript remains strict and there are no avoidable unsafe casts.
- All user-visible text is localized.
- Relevant tests cover the changed behavior.
- `npm run lint`, relevant tests, and `npm run build` pass.
- No generated or unrelated files were changed accidentally.
- Existing URLs, serialized data, and backward compatibility are preserved unless intentionally changed.
- The resulting code is simpler or clearer than the code it replaces.
