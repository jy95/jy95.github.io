// src/components/toolpad/utils.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getDrawerSxTransitionMixin, getDrawerWidthTransitionMixin } from './utils';

function makeFakeTheme() {
    return {
        transitions: {
            easing: { sharp: 'sharp-easing' },
            duration: { enteringScreen: 225, leavingScreen: 195 },
            create: vi.fn((props: unknown, options: unknown) => ({ props, options })),
        },
    };
}

describe('getDrawerSxTransitionMixin', () => {
    it('uses the enteringScreen duration when expanded', () => {
        const theme = makeFakeTheme();
        const { transition } = getDrawerSxTransitionMixin(true, 'width');
        (transition as (t: unknown) => unknown)(theme);

        expect(theme.transitions.create).toHaveBeenCalledWith('width', {
            easing: 'sharp-easing',
            duration: 225,
        });
    });

    it('uses the leavingScreen duration when collapsed', () => {
        const theme = makeFakeTheme();
        const { transition } = getDrawerSxTransitionMixin(false, 'width');
        (transition as (t: unknown) => unknown)(theme);

        expect(theme.transitions.create).toHaveBeenCalledWith('width', {
            easing: 'sharp-easing',
            duration: 195,
        });
    });

    it('forwards whatever property name is passed in', () => {
        const theme = makeFakeTheme();
        const { transition } = getDrawerSxTransitionMixin(true, 'opacity');
        (transition as (t: unknown) => unknown)(theme);

        expect(theme.transitions.create).toHaveBeenCalledWith('opacity', expect.any(Object));
    });

    it('always uses the sharp easing curve, regardless of expanded state', () => {
        const theme = makeFakeTheme();
        const { transition: expandedTransition } = getDrawerSxTransitionMixin(true, 'width');
        const { transition: collapsedTransition } = getDrawerSxTransitionMixin(false, 'width');

        (expandedTransition as (t: unknown) => unknown)(theme);
        (collapsedTransition as (t: unknown) => unknown)(theme);

        for (const call of theme.transitions.create.mock.calls) {
            expect((call[1] as { easing: string }).easing).toBe('sharp-easing');
        }
    });
});

describe('getDrawerWidthTransitionMixin', () => {
    it('always transitions the "width" property', () => {
        const theme = makeFakeTheme();
        const { transition } = getDrawerWidthTransitionMixin(true);
        (transition as (t: unknown) => unknown)(theme);

        expect(theme.transitions.create).toHaveBeenCalledWith('width', expect.any(Object));
    });

    it('sets overflowX to hidden', () => {
        expect(getDrawerWidthTransitionMixin(true).overflowX).toBe('hidden');
        expect(getDrawerWidthTransitionMixin(false).overflowX).toBe('hidden');
    });

    it('still varies duration based on isExpanded, like the base mixin', () => {
        const theme = makeFakeTheme();
        const { transition } = getDrawerWidthTransitionMixin(false);
        (transition as (t: unknown) => unknown)(theme);

        expect(theme.transitions.create).toHaveBeenCalledWith('width', {
            easing: 'sharp-easing',
            duration: 195,
        });
    });
});
