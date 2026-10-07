import { describe, expect, it } from 'vitest';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import { leafPaths } from '@/components/toolpad/navigation/navigationPaths';
import type { Navigation } from '@/components/toolpad/types';
import NavigationMenu from './MenuEntries';

const paths = ['/games', '/games/series', '/games/dlcs', '/companies', '/games/random', '/tests', '/tier/games', '/tier/backlog', '/tier/tests', '/planning', '/backlog', '/selection', '/stats', '/links'];

describe('NavigationMenu', () => {
    it('uses icon-backed presentation groups without destinations', () => {
        const navigation = NavigationMenu();
        expect(navigation.map(item => item.kind === 'group' ? item.id : undefined)).toEqual(['browse', 'opinions', 'coming-up', 'saved', 'more']);
        for (const item of navigation) {
            expect(item.icon).toBeTruthy();
            expect(item.path).toBeUndefined();
            expect(item.segment).toBeUndefined();
        }
        expect(leafPaths(navigation)).toEqual(paths);
    });

    it('describes every leaf in both locales and preserves the live selection badge', () => {
        function verify(items: Navigation) {
            for (const item of items) {
                if (item.children) verify(item.children);
                else {
                    expect(item.hintKey).toBeTruthy();
                    const key = item.hintKey?.split('.')[1];
                    for (const messages of [en, fr]) {
                        expect(Object.entries(messages.dashboard.menuEntries.hints).find(([name]) => name === key)?.[1]).toBeTruthy();
                    }
                    if (item.path === '/selection') expect(item.badge).toBeTruthy();
                }
            }
        }
        verify(NavigationMenu());
        expect(en.dashboard.menuEntries.sections.saved).toBe('Saved');
        expect(fr.dashboard.menuEntries.sections.saved).toBe('Favoris');
    });
});
