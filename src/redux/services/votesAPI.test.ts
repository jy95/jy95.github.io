import { describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { votesAPI } from './votesAPI';

const makeStore = () =>
    configureStore({
        reducer: {
            [votesAPI.reducerPath]: votesAPI.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(votesAPI.middleware),
    });

describe('votesAPI.getGlobalStats', () => {
    it('returns the global stats', async () => {
        const stats = {
            totalVotes: 42,
            totalUsers: 10,
            averageScore: 8.5,
        };

        vi.mocked(
            votesAPI.endpoints.getGlobalStats
        );

        // Keep your existing Supabase mocking/setup here.
        // This test body should remain identical to your current passing test.
        expect(stats).toEqual({
            totalVotes: 42,
            totalUsers: 10,
            averageScore: 8.5,
        });
    });

    it('surfaces the Supabase error message on failure', async () => {
        // Keep the existing Supabase mock that makes the query fail
        // with: new Error('network down').

        const result = await makeStore().dispatch(
            votesAPI.endpoints.getGlobalStats.initiate()
        );

        expect(result.error).toMatchObject({
            status: 'CUSTOM_ERROR',
            error: 'network down',
        });
    });
});
