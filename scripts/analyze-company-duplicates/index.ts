import { openDatabase } from "../common/db";
import { loadCompanies } from "./database";
import { analyzeCompanies } from "./analyze";
import { writeReport } from "./report";

function main(): void {
    const db = openDatabase({
        readonly: true,
    });

    try {
        const companies = loadCompanies(db);
        const report = analyzeCompanies(companies);

        writeReport(report);
    } finally {
        db.close();
    }
}

try {
    main();
} catch (error) {
    console.error(
        "Company duplicate analysis failed:",
        error
    );

    process.exitCode = 1;
}