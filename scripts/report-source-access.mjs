import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// Narrow validator for the report's Methods 2.1 source table. It reads the report
// and file metadata only. It cannot establish content access or source coverage.
const header = ['Source file', 'Content access', 'Hash action', 'Actor and supporting result/receipt'];

function cells(line) {
  const text = line.trim();
  if (!text.startsWith('|') || !text.endsWith('|')) return null;
  const result = []; let cell = '', ticks = 0;
  for (let i = 1; i < text.length - 1; i++) {
    const char = text[i];
    if (char === '\\' && i + 1 < text.length - 1) { cell += char + text[++i]; continue; }
    if (char === '`') {
      const count = text.slice(i).match(/^`+/)[0].length;
      if (!ticks) ticks = count; else if (ticks === count) ticks = 0;
      cell += '`'.repeat(count); i += count - 1; continue;
    }
    if (char === '|' && !ticks) { result.push(cell.trim()); cell = ''; }
    else cell += char;
  }
  if (ticks) return null;
  return [...result, cell.trim()];
}

function sourcePath(cell) {
  // No prose suffixes or multiple links/code spans in the source column.
  const code = cell.match(/^`([^`\n]+)`$/);
  if (code) return code[1].replace(/\\\|/g, '|');
  const link = cell.match(/^\[[^\[\]\n]+\]\((?:<([^<>\n]+)>|([^\s()<>]+))\)$/);
  if (!link) return null;
  try { return decodeURIComponent((link[1] ?? link[2]).split('#')[0]).replace(/\\\|/g, '|'); }
  catch { return null; }
}

export function validateSourceAccess(markdown, {baseDir} = {}) {
  const issues = [], rows = [];
  const issue = (code, line, detail) => issues.push({code, line, detail});
  if (!baseDir || !path.isAbsolute(baseDir)) {
    return {pass:false, rows, issues:[{code:'BASE_DIRECTORY_REQUIRED', line:0, detail:'An absolute report directory is required to resolve source paths.'}]};
  }
  // Exclude comments and fenced examples while preserving original line numbers.
  const lines = markdown.replace(/<!--[\s\S]*?(?:-->|$)/g, s => s.replace(/[^\n]/g, ' ')).split(/\r?\n/);
  let fence = null;
  const visible = lines.map(line => {
    if (fence) {
      if (new RegExp('^ {0,3}' + fence.char + '{' + fence.length + ',}\\s*$').test(line)) fence = null;
      return '';
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (open) { fence = {char:open[1][0], length:open[1].length}; return ''; }
    return line;
  });
  const starts = visible.flatMap((line, i) => /^###\s+2\.1(?:\s|$)/.test(line) ? [i] : []);
  if (starts.length !== 1) {
    return {pass:false, rows, issues:[{code:'SOURCE_SECTION_REQUIRED', line:0, detail:'Expected exactly one Methods 2.1 subsection.'}]};
  }
  const start = starts[0];
  let end = visible.findIndex((line, i) => i > start && /^#{1,3}\s/.test(line));
  if (end < 0) end = visible.length;
  const tables = [];
  for (let i = start + 1; i < end; i++) if (JSON.stringify(cells(visible[i])) === JSON.stringify(header)) tables.push(i);
  if (tables.length !== 1) {
    return {pass:false, rows, issues:[{code:'SOURCE_TABLE_REQUIRED', line:start + 1, detail:'Expected exactly one source-access table with the four canonical columns.'}]};
  }
  const table = tables[0], separator = cells(visible[table + 1] ?? '');
  if (!separator || separator.length !== 4 || separator.some(c => !/^:?-{3,}:?$/.test(c))) {
    issue('INVALID_TABLE_SEPARATOR', table + 2, 'Expected four Markdown table separator cells.');
  }
  const seen = new Set();
  for (let i = table + 2; i < end && visible[i].trim().startsWith('|'); i++) {
    const row = cells(visible[i]);
    if (!row || row.length !== 4 || row.some(c => !c)) { issue('INVALID_SOURCE_ROW', i + 1, 'Expected four nonempty cells.'); continue; }
    const source = sourcePath(row[0]);
    if (!source || /^[a-z][a-z0-9+.-]*:/i.test(source) || /[\x00-\x1f]/.test(source)) {
      issue('SINGLE_SOURCE_REQUIRED', i + 1, 'Source file must contain exactly one local file link or one backtick-quoted path; move all qualifiers to other columns.'); continue;
    }
    const resolved = path.resolve(baseDir, source);
    try {
      if (!fs.statSync(resolved).isFile()) { issue('SOURCE_NOT_FILE', i + 1, source); continue; }
      const canonical = fs.realpathSync(resolved);
      if (seen.has(canonical)) issue('DUPLICATE_SOURCE', i + 1, source);
      seen.add(canonical);
      rows.push({line:i + 1, source, resolved, canonical});
    } catch { issue('SOURCE_UNAVAILABLE', i + 1, source); }
  }
  if (!rows.length) issue('NO_SOURCE_ROWS', table + 1, 'No resolvable single-file rows found.');
  return {pass:issues.length === 0, rows, issues, scope:'Table structure and local file metadata only; no content-read, coverage, hash-comparison or mapped-root acceptance.'};
}

// node report-source-access.mjs --report /absolute/report.md
// node report-source-access.mjs --stdin --base-dir /absolute/report-directory
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    let markdown, baseDir;
    if (args.length === 2 && args[0] === '--report') {
      const report = path.resolve(args[1]); baseDir = path.dirname(report); markdown = fs.readFileSync(report, 'utf8');
    } else if (args.length === 3 && args[0] === '--stdin' && args[1] === '--base-dir') {
      baseDir = args[2]; markdown = fs.readFileSync(0, 'utf8');
    } else throw new Error('Usage: --report FILE, or --stdin --base-dir ABSOLUTE_DIRECTORY');
    const result = validateSourceAccess(markdown, {baseDir});
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exitCode = result.pass ? 0 : 1;
  } catch (error) {
    process.stdout.write(JSON.stringify({pass:false, issues:[{code:'INPUT_ERROR', detail:error.message}]}) + '\n');
    process.exitCode = 2;
  }
}
