import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const { supabaseMock, fromMock } = vi.hoisted(() => {
    const fromMock = vi.fn();
    return {
        supabaseMock: { from: fromMock },
        fromMock,
    };
});

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => supabaseMock,
}));

import { votesAPI } from './votesAPI';

function makeStore() {
    return configureStore({
        reducer: { [votesAPI.reducerPath]: votesAPI.reducer },
        middleware: (getDefault) => getDefault().concat(votesAPI.middleware),
    });
}

beforeEach(() => {
    fromMock.mockReset();
});

describe('votesAPI.getGlobalStats', () => {
    it('reduces rows into a { slug: likes_count } map', async () => {
        fromMock.mockReturnValue({
            select: vi.fn().mockResolvedValue({
                data: [
                    { game_slug: 'batman', likes_count: 3 },
                    { game_slug: 'portal', likes_count: 7 },
                ],
                error: null,
            }),
        });

        const result = await makeStore().dispatch(
            votesAPI.endpoints.getGlobalStats.initiate()
        );

        expect(result.data).toEqual({
            batman: 3,
            portal: 7,
        });
    });

    it('surfaces the Supabase error message on failure', async () => {
        fromMock.mockReturnValue({
            select: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'network down' },
            }),
        });

        const result = await makeStore().dispatch(
            votesAPI.endpoints.getGlobalStats.initiate()
        );

        expect(result.error).toMatchObject({
            status: 'CUSTOM_ERROR',
            error: 'network down',
        });
    });
});

describe('votesAPI.getMyVotes', () => {
    it('returns [] and never queries Supabase when userId is undefined', async () => {
        const result = await makeStore().dispatch(
            votesAPI.endpoints.getMyVotes.initiate(undefined)
        );

        expect(result.data).toEqual([]);
        expect(fromMock).not.toHaveBeenCalled();
    });

    it('returns the slugs the user voted for', async () => {
        fromMock.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [
                        { game_slug: 'batman' },
                        { game_slug: 'portal' },
                    ],
                    error: null,
                }),
            }),
        });

        const result = await makeStore().dispatch(
            votesAPI.endpoints.getMyVotes.initiate('user-1')
        );

        expect(result.data).toEqual(['batman', 'portal']);
    });
});

describe('votesAPI.toggleVote optimistic updates', () => {
    it('bumps the count and adds the slug before the network call settles', async () => {
        const store = makeStore();

        fromMock.mockReturnValueOnce({
            select: vi.fn().mockResolvedValue({
                data: [{ game_slug: 'batman', likes_count: 3 }],
                error: null,
            }),
        });

        await store.dispatch(
            votesAPI.endpoints.getGlobalStats.initiate()
        );

        fromMock.mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            }),
        });

        await store.dispatch(
            votesAPI.endpoints.getMyVotes.initiate('user-1')
        );

        // Never resolve insert() synchronously, so we can inspect the
        // optimistic patch before the mutation settles.
        let resolveInsert: (v: unknown) => void = () => {};

        fromMock.mockReturnValueOnce({
            insert: vi.fn().mockReturnValue(
                new Promise((res) => {
                    resolveInsert = res;
                })
            ),
        });

        const pending = store.dispatch(
            votesAPI.endpoints.toggleVote.initiate({
                slug: 'batman',
                userId: 'user-1',
                hasVoted: false,
            })
        );

        const stats = votesAPI.endpoints.getGlobalStats.select(undefined)(
            store.getState()
        );

        const votes = votesAPI.endpoints.getMyVotes.select('user-1')(
            store.getState()
        );

        expect(stats.data).toEqual({
            batman: 4,
        });

        expect(votes.data).toEqual(['batman']);

        resolveInsert({ error: null });

        await pending;
    });

    it('rolls back the optimistic patch when the mutation fails', async () => {
        const store = makeStore();

        fromMock.mockReturnValueOnce({
            select: vi.fn().mockResolvedValue({
                data: [{ game_slug: 'batman', likes_count: 3 }],
                error: null,
            }),
        });

        await store.dispatch(
            votesAPI.endpoints.getGlobalStats.initiate()
        );

        fromMock.mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [{ game_slug: 'batman' }],
                    error: null,
                }),
            }),
        });

        await store.dispatch(
            votesAPI.endpoints.getMyVotes.initiate('user-1')
        );

        fromMock.mockReturnValueOnce({
            delete: vi.fn().mockReturnValue({
                match: vi.fn().mockResolvedValue({
                    error: { message: 'delete failed' },
                }),
            }),
        });

        await store.dispatch(
            votesAPI.endpoints.toggleVote.initiate({
                slug: 'batman',
                userId: 'user-1',
                hasVoted: true,
            })
        );

        const stats = votesAPI.endpoints.getGlobalStats.select(undefined)(
            store.getState()
        );

        const votes = votesAPI.endpoints.getMyVotes.select('user-1')(
            store.getState()
        );

        expect(stats.data).toEqual({
            batman: 3,
        });

        expect(votes.data).toEqual(['batman']);
    });
});
