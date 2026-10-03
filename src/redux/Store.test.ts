import { describe, it, expect } from 'vitest';
import { makeStore } from './Store';
import { api } from './services/api';

describe('makeStore', () => {
    it('creates a fresh, independent store instance on every call', () => {
        expect(makeStore()).not.toBe(makeStore());
    });

    it('registers only the shared RTK Query reducer', () => {
        expect(Object.keys(makeStore().getState())).toEqual([api.reducerPath]);
    });

    it('starts with an empty RTK Query cache', () => {
        const apiState = makeStore().getState()[api.reducerPath];
        expect(apiState.queries).toEqual({});
        expect(apiState.mutations).toEqual({});
    });

    it('uses one shared RTK Query cache for injected endpoints', () => {
        expect(api.reducerPath).toBe('api');
    });
});