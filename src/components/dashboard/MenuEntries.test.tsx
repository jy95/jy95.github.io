import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { leafPaths } from '@/components/toolpad/navigation/navigationPaths';
import type { Navigation } from '@/components/toolpad/types';
import en from '../../../messages/en.json';
import fr from '../../../messages/fr.json';
import NavigationMenu from './MenuEntries';
import PersonalSelectionBadge from './PersonalSelectionBadge';

const childPaths = [
    ['/games', '/games/series', '/games/dlcs', '/companies', '/games/random', '/tests'],
    ['/planning', '/backlog'],
    ['/selection'],
    ['/tier/games', '/tier/backlog', '/tier/tests'],
    ['/stats', '/links'],
];
const paths = childPaths.flat();

function messageAt(messages: object, key: string): unknown {
    let value: unknown = messages;
    for (const part of key.split('.')) {
        if (typeof value !== 'object' || value === null) return undefined;
        value = Object.entries(value).find(([name]) => name === part)?.[1];
    }
    return value;
}

describe('NavigationMenu', () => {
    it('uses icon-backed presentation groups without destinations', () => {
        const navigation = NavigationMenu();
        expect(navigation.map(item => item.kind === 'group' ? item.id : undefined)).toEqual(['browse', 'coming-up', 'saved', 'opinions', 'more']);
        for (const item of navigation) {
            expect(item.icon).toBeTruthy();
            expect(item.path).toBeUndefined();
            expect(item.segment).toBeUndefined();
        }
        expect(navigation.map(item => item.children?.map(child => child.path))).toEqual(childPaths);
        for (const group of navigation) {
            for (const child of group.children ?? []) {
                expect(child.children).toBeUndefined();
                expect(child.kind).toBeUndefined();
            }
        }
        const rankings = navigation.find(item => item.kind === 'group' && item.id === 'opinions');
        expect(rankings?.titleKey).toBe('tierTabs');
        expect(isValidElement(rankings?.icon) && rankings.icon.type).toBe(LeaderboardIcon);
        expect(leafPaths(navigation)).toEqual(paths);
        expect(new Set(leafPaths(navigation)).size).toBe(14);
    });

    it('describes every leaf in both locales and preserves the live selection badge', () => {
        function verify(items: Navigation) {
            for (const item of items) {
                if (item.children) verify(item.children);
                else {
                    expect(item.icon).toBeTruthy();
                    expect(item.titleKey).toBeTruthy();
                    expect(item.hintKey).toBeTruthy();
                    for (const messages of [en, fr]) {
                        expect(messageAt(messages.dashboard.menuEntries, item.titleKey)).toBeTruthy();
                        expect(messageAt(messages.dashboard.menuEntries, item.hintKey ?? '')).toBeTruthy();
                    }
                    if (item.path === '/selection') expect(item.badge).toBe(PersonalSelectionBadge);
                }
            }
        }
        verify(NavigationMenu());
        expect(en.dashboard.menuEntries.sections.saved).toBe('My space');
        expect(fr.dashboard.menuEntries.sections.saved).toBe('Mon espace');
        expect(en.dashboard.menuEntries.sections.more).toBe('Resources');
        expect(fr.dashboard.menuEntries.sections.more).toBe('Ressources');
        expect(en.dashboard.menuEntries.tierTabs).toBe('Tier lists');
        expect(fr.dashboard.menuEntries.tierTabs).toBe('Classements');
        expect(en.dashboard.menuEntries.selection).toBe('My selection');
        expect(fr.dashboard.menuEntries.selection).toBe('Ma sélection');
    });
});
