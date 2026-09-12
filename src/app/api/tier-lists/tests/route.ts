import { staticJsonRoute } from "@/lib/http/staticJsonRoute";

export async function GET() {
    return staticJsonRoute(() => import("./tests.json"));
}