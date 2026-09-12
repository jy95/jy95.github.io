import { staticJsonRoute } from "@/lib/http/staticJsonRoute";

export const GET = staticJsonRoute(() => import("./backlog.json"));
