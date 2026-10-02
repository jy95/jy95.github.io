import { cachedJson } from "@/lib/http/cachedJson";
import { loadSelectionCatalogue } from "@/features/selection/catalogue";

export async function GET() {
    return cachedJson(await loadSelectionCatalogue());
}