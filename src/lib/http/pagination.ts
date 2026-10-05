export type PaginationResponse<T> = {
    items: T[];
    total_items: number;
    total_pages: number;
    pageSize: number;
    page: number;
};

export function parsePageParams(params: URLSearchParams) {
    const parsePositive = (value: string | null, fallback: number) => {
        const number = Number(value);
        return Number.isSafeInteger(number) && number > 0 ? number : fallback;
    };
    return { page: parsePositive(params.get("page"), 1), pageSize: Math.min(parsePositive(params.get("pageSize"), 12), 100) };
}

export function paginate<T>(items: T[], { page, pageSize }: { page: number; pageSize: number }): PaginationResponse<T> {
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total_items: items.length,
        total_pages: Math.ceil(items.length / pageSize), pageSize, page };
}
