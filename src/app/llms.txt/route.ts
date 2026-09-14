import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

export async function GET() {
    const llmsContext = await readFile(resolve(process.cwd(), "src/app/llms.txt/llms.txt"), "utf-8");

    return new Response(llmsContext, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
