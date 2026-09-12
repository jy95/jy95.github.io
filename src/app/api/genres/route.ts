import { staticJsonRoute } from "@/lib/http/staticJsonRoute";

export type Genre = {
    // identifier
    id: number;
    // untraslated name
    name: string;
}
export type GenreResponse = Genre[];

export const GET = staticJsonRoute<GenreResponse>(() => import("./genres.json"));
