import { describe, it, expect } from 'vitest';
import { isCardGame, toGameDetailsEntry } from './adapters';
import type { CardGame } from '@/redux/sharedDefintion';
import type { BacklogEntry } from '@/app/api/backlog/route';

const cardGame: CardGame = {
    id: 'abc123',
    title: 'A Card Game',
    url: 'https://www.youtube.com/watch?v=abc123',
    url_type: 'VIDEO',
    imagePath: '/covers/abc123/cover.webp',
};

const backlogEntry: BacklogEntry = {
    id: '42',
    title: 'A Backlog Entry',
    imagePath: '/backlogcovers/42/cover.webp',
};

describe('isCardGame', () => {
    it('returns true for entries carrying url_type', () => {
        expect(isCardGame(cardGame)).toBe(true);
    });

    it('returns false for backlog entries', () => {
        expect(isCardGame(backlogEntry)).toBe(false);
    });
});

describe('toGameDetailsEntry', () => {
    it('tags card games with kind "card" and preserves their fields', () => {
        const result = toGameDetailsEntry(cardGame);
        expect(result.kind).toBe('card');
        expect(result).toMatchObject(cardGame);
    });

    it('tags backlog entries with kind "backlog" and preserves their fields', () => {
        const result = toGameDetailsEntry(backlogEntry);
        expect(result.kind).toBe('backlog');
        expect(result).toMatchObject(backlogEntry);
    });

    it('round-trips through isCardGame consistently', () => {
        // Whatever toGameDetailsEntry decides, it must agree with the
        // discriminator isCardGame used to make that decision.
        const cardResult = toGameDetailsEntry(cardGame);
        const backlogResult = toGameDetailsEntry(backlogEntry);
        expect(cardResult.kind === 'card').toBe(isCardGame(cardGame));
        expect(backlogResult.kind === 'card').toBe(isCardGame(backlogEntry));
    });
});