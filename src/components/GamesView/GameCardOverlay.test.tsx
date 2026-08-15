import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import GameCardOverlay from './GameCardOverlay';
import type { CardGame } from '@/redux/sharedDefintion';

const baseGame: CardGame = {
    id: '1',
    title: 'Some Long Game Title',
    url: 'https://example.com',
    url_type: 'VIDEO',
    imagePath: '/covers/1/cover.webp',
};

describe('GameCardOverlay', () => {
    it('renders the game title', () => {
        render(<GameCardOverlay game={baseGame} />);
        expect(screen.getByText('Some Long Game Title')).toBeInTheDocument();
    });

    it('renders a different title for a different game', () => {
        render(<GameCardOverlay game={{ ...baseGame, title: 'Another Title' }} />);
        expect(screen.getByText('Another Title')).toBeInTheDocument();
        expect(screen.queryByText('Some Long Game Title')).not.toBeInTheDocument();
    });

    it('does not render anything besides the title (no duration, no extra fields required)', () => {
        const { container } = render(<GameCardOverlay game={baseGame} />);
        expect(container.textContent).toBe('Some Long Game Title');
    });
});
