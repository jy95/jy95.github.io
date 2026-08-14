import { describe, it, expect } from 'vitest';
import * as tasks from './index';

describe('tasks barrel file', () => {
    it('re-exports every task function', () => {
        expect(typeof tasks.addGameToDatabase).toBe('function');
        expect(typeof tasks.updateGameInDatabase).toBe('function');
        expect(typeof tasks.deleteGameFromDatabase).toBe('function');
        expect(typeof tasks.addBacklogToDatabase).toBe('function');
        expect(typeof tasks.deleteBacklogFromDatabase).toBe('function');
        expect(typeof tasks.cleanBacklog).toBe('function');
        expect(typeof tasks.addSerieToDatabase).toBe('function');
        expect(typeof tasks.manageSerieInDatabase).toBe('function');
        expect(typeof tasks.manageDlcsInDatabase).toBe('function');
        expect(typeof tasks.addTestToDatabase).toBe('function');
        expect(typeof tasks.updateTestInDatabase).toBe('function');
        expect(typeof tasks.deleteTestFromDatabase).toBe('function');
        expect(typeof tasks.updateTierLists).toBe('function');
        expect(typeof tasks.copyCovers).toBe('function');
        expect(typeof tasks.addCover).toBe('function');
    });
});