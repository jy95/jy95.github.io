import { describe, expect, it, vi } from "vitest";

const { loadCompaniesMock } = vi.hoisted(() => ({ loadCompaniesMock: vi.fn() }));
vi.mock("@/app/api/companies/data", () => ({ loadCompanies: loadCompaniesMock }));
vi.mock("./CompanyDetailClient", () => ({ default: () => null }));

import CompanyDetailClient from "./CompanyDetailClient";
import CompanyDetailPage, { generateStaticParams } from "./page";

describe("company detail server route", () => {
    it("generates a path for every company ID in the generated data", async () => {
        loadCompaniesMock.mockResolvedValueOnce([{ id: 1 }, { id: 42 }]);

        expect(await generateStaticParams()).toEqual([{ id: "1" }, { id: "42" }]);
        expect(loadCompaniesMock).toHaveBeenCalledOnce();
    });

    it("passes the resolved route ID to the client view", async () => {
        const view = await CompanyDetailPage({ params: Promise.resolve({ id: "42" }) });

        expect(view.type).toBe(CompanyDetailClient);
        expect(view.props).toEqual({ id: "42" });
    });
});
