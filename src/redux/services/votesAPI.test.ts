import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: mockFrom,
    }),
}));

import { api } from './api';
import { votesAPI } from './votesAPI';

const makeStore = () =>
    configureStore({
        reducer: {
            [api.reducerPath]: api.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware),
    });

describe('votesAPI.getGlobalStats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('surfaces the Supabase error message on failure', async () => {
        mockFrom.mockReturnValueOnce({
            select: vi.fn().mockResolvedValueOnce({
                data: null,
                error: {
                    message: 'network down',
                },
            }),
        });

        const result = await makeStore().dispatch(
            votesAPI.endpoints.getGlobalStats.initiate()
        );

        expect(result.error).toEqual({
            status: 'CUSTOM_ERROR',
            error: 'network down',
        });
    });
});
