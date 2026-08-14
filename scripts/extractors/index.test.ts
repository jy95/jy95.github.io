import { describe, it, expect } from 'vitest';
import * as extractors from './index';

describe('extractors barrel file', () => {
    it('re-exports every extractor function', () => {
        expect(typeof extractors.extractAndSavePlatforms).toBe('function');
        expect(typeof extractors.extractAndSaveGenres).toBe('function');
        expect(typeof extractors.extractAndSaveBacklog).toBe('function');
        expect(typeof extractors.extractAndSavePlanning).toBe('function');
        expect(typeof extractors.extractAndSaveGames).toBe('function');
        expect(typeof extractors.extractAndSaveSeries).toBe('function');
        expect(typeof extractors.extractAndSaveTests).toBe('function');
        expect(typeof extractors.extractAndSaveStats).toBe('function');
        expect(typeof extractors.extractAndSavePastGames).toBe('function');
        expect(typeof extractors.extractAndSaveDLCS).toBe('function');
        expect(typeof extractors.extractAndSaveRandomList).toBe('function');
        expect(typeof extractors.extractAndSavePastGamesToFeeds).toBe('function');
        expect(typeof extractors.extractAndSaveTierListGames).toBe('function');
        expect(typeof extractors.extractAndSaveTierListBacklog).toBe('function');
        expect(typeof extractors.extractAndSaveTierListCategories).toBe('function');
        expect(typeof extractors.extractAndSaveTierListGamesFuture).toBe('function');
        expect(typeof extractors.extractAndSaveTierListTests).toBe('function');
    });
});