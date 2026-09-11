import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {validateSourceAccess} from '../scripts/report-source-access.mjs';

const script = path.resolve(import.meta.dirname, '../scripts/report-source-access.mjs');
const table = '| Source file | Content access | Hash action | Actor and supporting result/receipt |\n|---|---|---|---|\n';
const row = source => `| ${source} | Complete current read | Not compared | This session |`;
const document = rows => '## 2. Methods\n\n### 2.1 Data Sources\n\n' + table + rows.join('\n') + '\n\n### 2.2 Computational Methods\n';
function fixture(t) {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'source-table-'));
  t.after(() => fs.rmSync(baseDir, {recursive:true, force:true}));
  for (const name of ['AGENTS.md','CLAUDE.md','SKILL.md','locations.md','location-contract.md','with spaces.txt','pipe|name.txt']) fs.writeFileSync(path.join(baseDir, name), name + '\n');
  return {baseDir};
}
const codes = result => result.issues.map(i => i.code);

test('separate instruction-file rows pass with paths containing spaces', t => {
  const options = fixture(t);
  const text = document(['AGENTS.md','CLAUDE.md','SKILL.md','locations.md','location-contract.md'].map(n=>row('`'+n+'`')).concat(row('[spaced](<with spaces.txt>)')));
  const result = validateSourceAccess(text, options);
  assert.equal(result.pass,true); assert.equal(result.rows.length,6);
});

test('both exact preserved native grouped rows are rejected', t => {
  const text=fs.readFileSync(path.join(import.meta.dirname,'fixtures/grouped-source-rows.md'),'utf8');
  const result=validateSourceAccess(text,fixture(t));
  assert.equal(result.pass,false);
  assert.deepEqual(result.issues.filter(i=>i.code==='SINGLE_SOURCE_REQUIRED').map(i=>i.line),[9,10]);
});

test('a group hidden in one code span fails file resolution', t => {
  assert.ok(codes(validateSourceAccess(document([row('`AGENTS.md and CLAUDE.md`')]),fixture(t))).includes('SOURCE_UNAVAILABLE'));
});

test('qualifiers must move out of source cells', t => {
  const options=fixture(t);
  assert.ok(codes(validateSourceAccess(document([row('[agents](AGENTS.md) (pre-edit)')]),options)).includes('SINGLE_SOURCE_REQUIRED'));
  assert.equal(validateSourceAccess(document(['| [agents](AGENTS.md) | Complete current read, pre-edit | Not compared | This session |']),options).pass,true);
});

test('pipes inside code or escaped table text do not change the column count', t => {
  const text=document(['| [file](pipe%7Cname.txt) | Read `a|b` | Not compared | Text with \\| escape |']);
  assert.equal(validateSourceAccess(text,fixture(t)).pass,true);
});

test('fenced or commented examples cannot supply the required table', t => {
  const options=fixture(t), valid=document([row('`AGENTS.md`')]);
  for(const text of ['```markdown\n'+valid+'```\n','<!--\n'+valid+'-->'])assert.equal(validateSourceAccess(text,options).pass,false);
  assert.equal(validateSourceAccess('~~~markdown\n'+valid+'~~~\n'+valid,options).pass,true);
});

test('missing or duplicate sections and tables fail closed', t => {
  const options=fixture(t), valid=document([row('`AGENTS.md`')]);
  for(const text of ['',valid+valid,valid.replace('\n\n### 2.2', '\n\n'+table+row('`CLAUDE.md`')+'\n\n### 2.2')])assert.equal(validateSourceAccess(text,options).pass,false);
});

test('duplicate paths and symlink aliases cannot count as separate sources', t => {
  const options=fixture(t);
  fs.symlinkSync('AGENTS.md',path.join(options.baseDir,'alias.md'));
  for(const other of ['./AGENTS.md','alias.md']) {
    assert.ok(codes(validateSourceAccess(document([row('`AGENTS.md`'),row('`'+other+'`')]),options)).includes('DUPLICATE_SOURCE'));
  }
});

test('directories, absent files, remote URLs and empty anchors fail', t => {
  const options=fixture(t);
  for(const source of ['`.`','`missing.md`','[remote](https://example.com/a.md)','[anchor](#section)'])assert.equal(validateSourceAccess(document([row(source)]),options).pass,false);
});

test('empty tables and malformed columns or separators fail', t => {
  const options=fixture(t), valid=document([row('`AGENTS.md`')]);
  for(const text of [document([]),valid.replace('|---|---|---|---|','|--|--|--|--|'),valid.replace('| This session |','| |'),valid.replace('| This session |','| This session | extra |')])assert.equal(validateSourceAccess(text,options).pass,false);
});

test('file and stdin CLI routes agree and preserve all input bytes', t => {
  const {baseDir}=fixture(t), report=path.join(baseDir,'report.md'), text=document([row('`AGENTS.md`')]);
  fs.writeFileSync(report,text);
  const snapshot=()=>Object.fromEntries(fs.readdirSync(baseDir).map(n=>[n,fs.readFileSync(path.join(baseDir,n),'utf8')]));
  const before=snapshot();
  const file=spawnSync(process.execPath,[script,'--report',report],{encoding:'utf8'});
  const stdin=spawnSync(process.execPath,[script,'--stdin','--base-dir',baseDir],{input:text,encoding:'utf8'});
  assert.equal(file.status,0,file.stdout+file.stderr); assert.equal(stdin.status,0,stdin.stdout+stdin.stderr);
  assert.deepEqual(JSON.parse(file.stdout),JSON.parse(stdin.stdout)); assert.deepEqual(snapshot(),before);
});

test('CLI returns distinct validation failure and input failure statuses', t => {
  const {baseDir}=fixture(t);
  const bad=spawnSync(process.execPath,[script,'--stdin','--base-dir',baseDir],{input:document([row('`AGENTS.md and CLAUDE.md`')]),encoding:'utf8'});
  assert.equal(bad.status,1); assert.equal(JSON.parse(bad.stdout).pass,false);
  const invalid=spawnSync(process.execPath,[script,'--unknown'],{encoding:'utf8'});
  assert.equal(invalid.status,2); assert.equal(JSON.parse(invalid.stdout).issues[0].code,'INPUT_ERROR');
});
