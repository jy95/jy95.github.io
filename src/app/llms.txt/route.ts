import {buildContentSummary} from "./content-summary";
import {buildFeeds} from "./feeds";
import { guidance } from "./guidance";
import {buildMediaPages} from "./media-pages";
import { overview } from "./overview";
import {buildSitePages} from "./site-pages";

export async function GET() {
    const llmsContext = [
        overview,
        buildSitePages(),
        buildContentSummary(),
        buildMediaPages(),
        buildFeeds(),
        guidance,
    ].join("\n\n");

    return new Response(llmsContext, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
