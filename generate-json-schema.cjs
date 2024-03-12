const tsj = require("ts-json-schema-generator");
const fs = require("fs");

// json file
const files = [
    // backlog.json
    {
        filename: "backlog.json",
        path: "src/app/api/backlog/route.ts",
        type: "RawPayload"
    },
    // games.json
    {
        filename: "games.json",
        path: "src/app/api/games/route.ts",
        type: "RawPayload"
    },
    // series.json
    {
        filename: "series.json",
        path: "src/app/api/series/route.ts",
        type: "RawPayload"
    },
    // tests.json
    {
        filename: "tests.json",
        path: "src/app/api/tests/route.ts",
        type: "RawPayload"
    },
]

// Iterate and generate file
for (let file of files) {

    const { filename, ...rest } = file;

    /** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
    let config = {
        ...rest,
        tsconfig: "tsconfig.json"
    };

    let outputPath = `.vscode/schemas/${filename}`;

    let schema = tsj.createGenerator(config).createSchema(config.type);
    let schemaString = JSON.stringify(schema, null, 2);
    fs.writeFile(outputPath, schemaString, (err) => {
        if (err) throw err;
    });

}