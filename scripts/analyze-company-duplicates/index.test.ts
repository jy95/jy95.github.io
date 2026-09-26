import { afterEach, describe, expect, it, vi } from "vitest";

const { openDatabase, loadCompanies, analyzeCompanies, writeReport, close } = vi.hoisted(() => ({
    openDatabase: vi.fn(),
    loadCompanies: vi.fn(),
    analyzeCompanies: vi.fn(),
    writeReport: vi.fn(),
    close: vi.fn(),
}));

vi.mock("../common/db", () => ({ openDatabase }));
vi.mock("./database", () => ({ loadCompanies }));
vi.mock("./analyze", () => ({ analyzeCompanies }));
vi.mock("./report", () => ({ writeReport }));

afterEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.restoreAllMocks();
    process.exitCode = 0;
});

describe("company duplicate entry point", () => {
    it("loads, analyzes, writes, and closes a read-only database", async () => {
        const companies = [{ id: 1, name: "Acme" }];
        const report = { companiesScanned: 1 };
        openDatabase.mockReturnValue({ close });
        loadCompanies.mockReturnValue(companies);
        analyzeCompanies.mockReturnValue(report);
        vi.spyOn(console, "error").mockImplementation(() => {});
        process.exitCode = 0;

        await import("./index");

        expect(openDatabase).toHaveBeenCalledWith({ readonly: true });
        expect(loadCompanies).toHaveBeenCalledWith({ close });
        expect(analyzeCompanies).toHaveBeenCalledWith(companies);
        expect(writeReport).toHaveBeenCalledWith(report);
        expect(close).toHaveBeenCalledOnce();
        expect(process.exitCode).toBe(0);
    });

    it.each([
        ["load", loadCompanies],
        ["analyze", analyzeCompanies],
        ["write", writeReport],
    ])("closes the database after a %s failure", async (_, failing) => {
        const error = new Error("failure");
        openDatabase.mockReturnValue({ close });
        failing.mockImplementation(() => { throw error; });
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        await import("./index");

        expect(close).toHaveBeenCalledOnce();
        expect(log).toHaveBeenCalledWith("Company duplicate analysis failed:", error);
        expect(process.exitCode).toBe(1);
        vi.restoreAllMocks();
    });

    it("reports database open failures", async () => {
        const error = new Error("open failure");
        openDatabase.mockImplementation(() => { throw error; });
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        await import("./index");

        expect(close).not.toHaveBeenCalled();
        expect(log).toHaveBeenCalledWith("Company duplicate analysis failed:", error);
        expect(process.exitCode).toBe(1);
        vi.restoreAllMocks();
    });
});
