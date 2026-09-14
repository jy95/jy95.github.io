import {getPathname, routing} from "@/i18n/routing";

interface RoutingConfig {
    defaultLocale: string;
    pathnames: Record<string, unknown>;
}

type PathResolver = (args: {locale: string; href: string}) => string;

const resolveConfiguredPath: PathResolver = ({locale, href}) => getPathname({
    locale: locale as typeof routing.defaultLocale,
    href: href as Parameters<typeof getPathname>[0]["href"],
});

export function buildSitePages(
    config: RoutingConfig = routing,
    resolvePathname: PathResolver = resolveConfiguredPath,
) {
    const paths = Object.keys(config.pathnames)
        .filter((pathname) => !pathname.includes("["))
        .map((pathname) => resolvePathname({
            locale: config.defaultLocale,
            href: pathname,
        }));

    return `## Site pages\n\n${paths.map((path) => `- ${path}`).join("\n")}`;
}
