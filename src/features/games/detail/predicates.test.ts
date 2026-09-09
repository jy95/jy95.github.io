import { describe, it, expect } from 'vitest';
import {
    hasDuration,
    hasHltbMain,
    hasHltbExtra,
    hasHltbCompletionist,
    hasReleaseDate,
    hasGenres,
} from './predicates';
import type { CardKindEntry, BacklogKindEntry, GameDetailsEntry } from './types';

const baseCard: CardKindEntry = {
    kind: 'card',
    id: '1',
    title: 'Some Game',
    imagePath: '/covers/1/cover.webp',
    url: 'https://example.com',
    url_type: 'VIDEO',
};

const baseBacklog: BacklogKindEntry = {
    kind: 'backlog',
    id: '1',
    title: 'Some Backlog Game',
    imagePath: '/backlogcovers/1/cover.webp',
};

describe('hasDuration', () => {
    it('is true for a card entry with a meaningful duration', () => {
        expect(hasDuration({ ...baseCard, duration: '01:30:00' })).toBe(true);
    });

    it('is false when duration is "00:00:00"', () => {
        expect(hasDuration({ ...baseCard, duration: '00:00:00' })).toBe(false);
    });

    it('is false when duration is missing', () => {
        expect(hasDuration(baseCard)).toBe(false);
    });

    it('is false for a backlog entry, regardless of its own fields', () => {
        expect(hasDuration(baseBacklog as unknown as GameDetailsEntry)).toBe(false);
    });
});

describe('hasHltbMain / hasHltbExtra / hasHltbCompletionist', () => {
    it('are true only for backlog entries with a meaningful value', () => {
        expect(hasHltbMain({ ...baseBacklog, hltb_main: '10:00:00' })).toBe(true);
        expect(hasHltbExtra({ ...baseBacklog, hltb_extra: '12:00:00' })).toBe(true);
        expect(hasHltbCompletionist({ ...baseBacklog, hltb_completionist: '20:00:00' })).toBe(true);
    });

    it('are false when the corresponding value is "00:00:00"', () => {
        expect(hasHltbMain({ ...baseBacklog, hltb_main: '00:00:00' })).toBe(false);
        expect(hasHltbExtra({ ...baseBacklog, hltb_extra: '00:00:00' })).toBe(false);
        expect(hasHltbCompletionist({ ...baseBacklog, hltb_completionist: '00:00:00' })).toBe(false);
    });

    it('are false when the corresponding value is undefined', () => {
        expect(hasHltbMain(baseBacklog)).toBe(false);
        expect(hasHltbExtra(baseBacklog)).toBe(false);
        expect(hasHltbCompletionist(baseBacklog)).toBe(false);
    });

    it('are false for card entries even if a matching field were present', () => {
        expect(hasHltbMain(baseCard as unknown as GameDetailsEntry)).toBe(false);
    });
});

describe('hasReleaseDate', () => {
    it('is true for a card entry with a string releaseDate', () => {
        expect(hasReleaseDate({ ...baseCard, releaseDate: '2020-01-01' })).toBe(true);
    });

    it('is false when releaseDate is missing', () => {
        expect(hasReleaseDate(baseCard)).toBe(false);
    });

    it('is false for backlog entries', () => {
        expect(hasReleaseDate(baseBacklog as unknown as GameDetailsEntry)).toBe(false);
    });
});

describe('hasGenres', () => {
    it('is true for a card entry with a non-empty genres array', () => {
        expect(hasGenres({ ...baseCard, genres: [1, 2] })).toBe(true);
    });

    it('is false for an empty genres array', () => {
        expect(hasGenres({ ...baseCard, genres: [] })).toBe(false);
    });

    it('is false when genres is missing', () => {
        expect(hasGenres(baseCard)).toBe(false);
    });

    it('is false for backlog entries', () => {
        expect(hasGenres(baseBacklog as unknown as GameDetailsEntry)).toBe(false);
    });
});