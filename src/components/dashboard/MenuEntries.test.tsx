import { describe, it, expect } from 'vitest';
import NavigationMenu from './MenuEntries';

describe('NavigationMenu', () => {
    it('returns a non-empty top-level navigation tree', () => {
        const nav = NavigationMenu();
        expect(nav.length).toBeGreaterThan(0);
    });

    it('includes a top-level entry for every primary section segment', () => {
        const nav = NavigationMenu();
        const segments = nav.map((item) => item.segment);
        expect(segments).toEqual(
            expect.arrayContaining(['games', 'planning', 'backlog', 'tier', 'tests', 'stats', 'links'])
        );
    });

    it('gives the games entry the expected children tabs', () => {
        const nav = NavigationMenu();
        const games = nav.find((item) => item.segment === 'games');
        expect(games?.children?.map((c) => c.segment)).toEqual([undefined, 'series', 'dlcs', 'random']);
    });

    it('gives the tier entry three children: games, backlog, tests', () => {
        const nav = NavigationMenu();
        const tier = nav.find((item) => item.segment === 'tier');
        expect(tier?.children).toHaveLength(3);
        expect(tier?.children?.map((c) => c.segment)).toEqual(['games', 'backlog', 'tests']);
    });

    it('every top-level entry defines an icon', () => {
        const nav = NavigationMenu();
        for (const item of nav) {
            expect(item.icon).toBeTruthy();
        }
    });

    it('every entry (top-level and nested) has a non-empty titleKey', () => {
        const nav = NavigationMenu();
        function assertTitleKeys(items: typeof nav) {
            for (const item of items) {
                expect(typeof item.titleKey).toBe('string');
                expect(item.titleKey.length).toBeGreaterThan(0);
                if (item.children) assertTitleKeys(item.children);
            }
        }
        assertTitleKeys(nav);
    });

    it('produces a fresh tree object on every call (no shared mutable state)', () => {
        const first = NavigationMenu();
        const second = NavigationMenu();
        expect(first).not.toBe(second);
        expect(first[0]).not.toBe(second[0]);
    });

    it('leaf entries without children never define a children array', () => {
        const nav = NavigationMenu();
        const planning = nav.find((item) => item.segment === 'planning');
        expect(planning?.children).toBeUndefined();
    });
});
