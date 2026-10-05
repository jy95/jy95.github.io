export function infinitePaginationOptions<T extends { total_pages: number }>() {
    return {
        initialPageParam: 1,
        getNextPageParam: (lastPage: T, _pages: T[], lastPageParam: number) =>
            lastPageParam < lastPage.total_pages ? lastPageParam + 1 : undefined,
    };
}

export function buildQueryUrl(path: string, parameters: Record<string, string | number | boolean>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters)) query.set(key, String(value));
    return `${path}?${query}`;
}
