import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { echoTranslations } from "@/test/mocks/nextIntl";

const getRelatedGamesQueryMock = vi.fn();

vi.mock("next-intl", () => echoTranslations());

vi.mock("@/redux/services/relatedGamesAPI", () => ({
    useGetRelatedGamesQuery: () => getRelatedGamesQueryMock(),
}));

vi.mock("./CardEntry", () => ({
    default: ({ game }: { game: { title: string } }) => <div>{game.title}</div>,
}));

import RelatedGames from "./RelatedGames";

const results = Array.from({ length: 9 }, (_, index) => ({
    id: `game-${index + 1}`,
    title: `Game ${index + 1}`,
    imagePath: `/covers/game-${index + 1}.webp`,
    url: `https://example.com/game-${index + 1}`,
    url_type: "VIDEO" as const,
}));

describe("RelatedGames", () => {
    beforeEach(() => {
        getRelatedGamesQueryMock.mockReturnValue({ data: { target: results } });
    });

    it("shows four games initially and four more per load-more action", () => {
        render(<RelatedGames gameId="target" initialLimit={4} loadMoreIncrement={4} />);

        expect(screen.getByText("Game 4")).toBeInTheDocument();
        expect(screen.queryByText("Game 5")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "common.loadMore" }));
        expect(screen.getByText("Game 8")).toBeInTheDocument();
        expect(screen.queryByText("Game 9")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "common.loadMore" }));
        expect(screen.getByText("Game 9")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "common.loadMore" })).not.toBeInTheDocument();
    });

    it("shows every result without load more when there are four or fewer", () => {
        getRelatedGamesQueryMock.mockReturnValue({ data: { target: results.slice(0, 4) } });

        render(<RelatedGames gameId="target" initialLimit={4} loadMoreIncrement={4} />);

        expect(screen.getByText("Game 4")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "common.loadMore" })).not.toBeInTheDocument();
    });
});
