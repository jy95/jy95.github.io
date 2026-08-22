import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CardBadgesLayer, CardOverlayLayer } from './CardLayers';

describe('CardBadgesLayer', () => {
    it('renders its children', () => {
        render(
            <CardBadgesLayer>
                <span>Badge content</span>
            </CardBadgesLayer>
        );
        expect(screen.getByText('Badge content')).toBeInTheDocument();
    });

    it('does not intercept pointer events (overlay must stay click-through)', () => {
        const { container } = render(
            <CardBadgesLayer>
                <span>Badge content</span>
            </CardBadgesLayer>
        );
        const layer = container.firstChild as HTMLElement;
        expect(layer).toHaveStyle({ pointerEvents: 'none' });
    });

    it('renders multiple children fragments', () => {
        render(
            <CardBadgesLayer>
                <span>First</span>
                <span>Second</span>
            </CardBadgesLayer>
        );
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });
});

describe('CardOverlayLayer', () => {
    it('renders its children', () => {
        render(
            <CardOverlayLayer>
                <span>Overlay content</span>
            </CardOverlayLayer>
        );
        expect(screen.getByText('Overlay content')).toBeInTheDocument();
    });

    it('is tagged with the card-overlay class used for the hover/focus opacity transition', () => {
        const { container } = render(
            <CardOverlayLayer>
                <span>Overlay content</span>
            </CardOverlayLayer>
        );
        expect(container.querySelector('.card-overlay')).toBeTruthy();
    });

    it('starts hidden (opacity 0) by default', () => {
        const { container } = render(
            <CardOverlayLayer>
                <span>Overlay content</span>
            </CardOverlayLayer>
        );
        const layer = container.querySelector('.card-overlay') as HTMLElement;
        expect(layer).toHaveStyle({ opacity: '0' });
    });
});
