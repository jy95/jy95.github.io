import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { echoTranslations } from "@/test/mocks/nextIntl";

const getRelatedGamesQueryMock = vi.fn();
const cardGridMock = vi.fn();
const loadingButtonMock = vi.fn();

vi.mock("next-intl", () => echoTranslations());

vi.mock("@/redux/services/relatedGamesAPI", () => ({
    useGetRelatedGamesQuery: () => getRelatedGamesQueryMock(),
}));

vi.mock("./CardGrid", () => ({
    CardGrid: (props: { items: typeof results; size: { xs: number; md: number; lg: number } }) => {
        cardGridMock(props);
        return <div data-testid="card-grid">{props.items.map(({ title }) => title).join(",")}</div>;
    },
}));

vi.mock("@/app/[locale]/games/_client/LoadingButton", () => ({
    default: (props: { onClick: () => void; disabled: boolean; loading: boolean; label: string }) => {
        loadingButtonMock(props);
        return <button onClick={props.onClick}>{props.label}</button>;
    },
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
        cardGridMock.mockClear();
        loadingButtonMock.mockClear();
        getRelatedGamesQueryMock.mockReturnValue({ data: { target: results } });
    });

    it("renders a decorative icon without changing the accessible heading", () => {
        render(<RelatedGames gameId="target" />);

        expect(screen.getByTestId("AutoAwesomeIcon")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByRole("heading", { name: "discovery.relatedGames.title" })).toBeInTheDocument();
    });

    it("uses the games gallery grid and shows four more games per load-more action", () => {
        render(<RelatedGames gameId="target" />);

        expect(cardGridMock).toHaveBeenLastCalledWith(expect.objectContaining({
            items: results.slice(0, 4),
            size: { xs: 6, md: 4, lg: 2 },
        }));
        expect(loadingButtonMock).toHaveBeenLastCalledWith(expect.objectContaining({
            loading: false,
            disabled: false,
            label: "common.loadMore",
        }));

        fireEvent.click(screen.getByRole("button", { name: "common.loadMore" }));
        expect(cardGridMock).toHaveBeenLastCalledWith(expect.objectContaining({
            items: results.slice(0, 8),
        }));

        fireEvent.click(screen.getByRole("button", { name: "common.loadMore" }));
        expect(cardGridMock).toHaveBeenLastCalledWith(expect.objectContaining({ items: results }));
        expect(screen.queryByRole("button", { name: "common.loadMore" })).not.toBeInTheDocument();
    });

    it("shows every result without load more when there are four or fewer", () => {
        getRelatedGamesQueryMock.mockReturnValue({ data: { target: results.slice(0, 4) } });

        render(<RelatedGames gameId="target" />);

        expect(cardGridMock).toHaveBeenLastCalledWith(expect.objectContaining({ items: results.slice(0, 4) }));
        expect(screen.queryByRole("button", { name: "common.loadMore" })).not.toBeInTheDocument();
    });

    it("renders no section when the selected game has no recommendations", () => {
        getRelatedGamesQueryMock.mockReturnValue({ data: {} });

        const { container } = render(<RelatedGames gameId="target" />);

        expect(container).toBeEmptyDOMElement();
        expect(cardGridMock).not.toHaveBeenCalled();
    });
});
