import {vi} from "vitest";

export const defineRouting = <T>(config: T): T => config;

export const createNavigation = () => ({
    Link: vi.fn(),
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
    getPathname: vi.fn(({href}: {href: string | {pathname: string}}) =>
        typeof href === "string" ? href : href.pathname,
    ),
});
