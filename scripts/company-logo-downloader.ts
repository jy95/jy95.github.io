import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase } from './common/db';
import { syncCoversBySearch } from './common/coverSearchRunner';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_ROOT = path.resolve(__dirname, '..', 'public/companies');

interface CompanyRow {
    /** Unique database identifier for the company. */
    id: number;
    /** Official name of the company. */
    name: string;
}

/**
 * Queries company entries from the database in read-only mode and executes the
 * cover search runner to download and save missing company logos.
 *
 * Automatically ensures the database connection is closed after processing,
 * even if errors occur during retrieval or search execution.
 *
 * @returns A promise that resolves when company logo searching and processing complete.
 * @throws {Error} Throws an error if the database operation or cover download pipeline encounters an issue.
 */
export async function run(): Promise<void> {
    const db = openDatabase({ readonly: true });

    try {
        const companies = db.prepare('SELECT id, name FROM companies').all() as CompanyRow[];

        await syncCoversBySearch(
            companies.map((company) => ({
                id: company.id,
                label: company.name,
                searchQuery: `${company.name} logo`,
            })),
            { outputRoot: OUTPUT_ROOT }
        );
    } finally {
        db.close();
    }
}

await run();