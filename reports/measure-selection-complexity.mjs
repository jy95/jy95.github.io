import { ESLint } from 'eslint';
import parser from '@typescript-eslint/parser';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const files = execFileSync('rg', ['--files', 'src/domain/selection', 'src/features/selection'], {encoding:'utf8'}).trim().split('\n').filter(f => /\.(ts|tsx)$/.test(f) && !f.includes('.test.'));
files.push('src/features/games/components/CardEntry.tsx','src/features/games/components/CardGrid.tsx','src/features/games/components/GroupedGamesAccordion.tsx','src/features/games/detail/GameToolbar.tsx','src/features/games/detail/GameDetailView.tsx','src/app/api/selection/route.ts','src/app/[locale]/selection/page.tsx','src/app/[locale]/tier/backlog/page.tsx','src/redux/services/selectionAPI.tsx');
const eslint = new ESLint({overrideConfigFile:true, overrideConfig: [{files:['**/*.{ts,tsx}'], languageOptions:{parser}, rules:{complexity:['error',{max:0,variant:'classic'}]}}]});
const results = await eslint.lintFiles(files.sort());
const diagnostics = results.flatMap(result => result.messages.filter(message => message.ruleId !== 'complexity'));
if (diagnostics.length) throw new Error(JSON.stringify(diagnostics));
const report = {analyzer:'ESLint', version:ESLint.version, configuration:'Isolated core rule with project TypeScript parser because configured React plugin crashes on ESLint 10; measurement complexity max=0, variant=classic to expose every function; project threshold=8', aggregateFileMetric:null, files:results.map(r=>({file:r.filePath.replace(process.cwd()+'/',''), functions:r.messages.filter(m=>m.ruleId==='complexity').map(m=>({line:m.line,column:m.column,description:m.message,complexity:Number(m.message.match(/complexity of (\d+)/)[1])}))}))};
writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
for (const f of report.files) console.log(`${f.file}: ${f.functions.map(m=>`${m.line}:${m.column}=${m.complexity}`).join(', ') || 'no functions'}`);

if (report.files.some(file => file.functions.some(fn => fn.complexity > 8))) process.exitCode = 1;
