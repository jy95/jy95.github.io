import { content } from "./content";
import { guidance } from "./guidance";
import { overview } from "./overview";
import { pages } from "./pages";

const llmsContext = [overview, pages, content, guidance].join("\n\n");

export function GET() {
    return new Response(llmsContext, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
