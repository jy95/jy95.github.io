import { staticJsonRoute } from "@/lib/http/staticJsonRoute";

export type Platform_Entry = {
    // Identifier
    id: number;
    // Database name, not translated by default
    name: string;
}
export type PlatformsResponse = Platform_Entry[];

export async function GET() {
    return staticJsonRoute<PlatformsResponse>(() => import("./platforms.json"));
}