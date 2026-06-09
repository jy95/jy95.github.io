import { NextResponse } from "next/server";

type sortOption = "asc" | "desc";

export async function GET(request: Request) {

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sortOrder = searchParams.get("sort") ?? "asc" as sortOption;

    // Categories data
    const categories = (await import("./categories.json")).default;
    // Sort categories according to the sort order
    categories.sort((a, b) => {
        // In case two categories have the same display order, we sort them by id to ensure a consistent order
        const primaryDiff = sortOrder === "asc" 
                    ? a.display_order - b.display_order 
                    : b.display_order - a.display_order;
        
        // If display order isn't enough to determine the order, we sort by id
        if (primaryDiff !== 0) {
            return primaryDiff;
        }
        return a.id - b.id;
    });

    // Extract slugs for performance reasons, as the frontend isn't interested in the other properties of the categories and it would be wasteful to send them over the network
    const slugs = categories.map(category => category.slug);

    return NextResponse.json(slugs, {
        headers: {
            "Cache-Control": "public, max-age=86400, must-revalidate"
        }
    });
}