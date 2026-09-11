import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {Readable, Writable} from 'node:stream';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createChecker, serve, MAX_DRAFT_BYTES, MAX_MESSAGE_BYTES} from '../scripts/report-source-access-tool.mjs';

const hash = x => createHash('sha256').update(x).digest('hex');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-tool-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  const source = dir+'/source with spaces.txt', report = dir+'/report.md';
  fs.writeFileSync(source, 'Protected synthetic source\n');
  const draft = '### 2.1 Sources\n\n| Source file | Content access | Hash action | Actor and supporting result/receipt |\n|---|---|---|---|\n| `source with spaces.txt` | Retained prime | Current hash | Fixture receipt |\n';
  return {dir,source,report,draft,checker:createChecker(report)};
}
const req = (id,method,params) => JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n';
async function exchange(checker, chunks) {
  let out = '';
  await serve(checker, Readable.from(chunks), new Writable({write(chunk,enc,cb){out+=chunk;cb();}}));
  return out.trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));
}
test('draft and saved receipts identify exact text; calls preserve source and report bytes', t => {
  const f=fixture(t), before=fs.readFileSync(f.source);
  const draft=f.checker.call('report_source_access_draft',{markdown:f.draft});
  assert.equal(draft.pass,true);assert.equal(draft.receipt.sha256,hash(f.draft));assert.equal(fs.existsSync(f.report),false);
  fs.writeFileSync(f.report,f.draft);const saved=f.checker.call('report_source_access_saved',{});
  assert.equal(saved.pass,true);assert.deepEqual({...saved.receipt,mode:'draft'},draft.receipt);
  assert.deepEqual(fs.readFileSync(f.source),before);assert.equal(fs.readFileSync(f.report,'utf8'),f.draft);
});
test('grouped source rows remain rejected through the adapter',t=>{
  const f=fixture(t);const result=f.checker.call('report_source_access_draft',{markdown:f.draft.replace('`source with spaces.txt`','`source with spaces.txt` + `another.md`')});
  assert.equal(result.pass,false);assert.ok(result.issues.some(x=>x.code==='SINGLE_SOURCE_REQUIRED'));
});
test('fixed target rejects path overrides, extra arguments, wrong types and unknown operations',t=>{
  const f=fixture(t);
  for(const args of [{markdown:f.draft,report:'/tmp/else.md'},{markdown:42},[],null,{}])assert.throws(()=>f.checker.call('report_source_access_draft',args));
  for(const args of [{report:f.source},[],null])assert.throws(()=>f.checker.call('report_source_access_saved',args));
  assert.throws(()=>f.checker.call('write',{}));assert.throws(()=>createChecker('report.md'));
});
test('draft size is enforced in UTF-8 bytes; invalid Unicode and empty text fail',t=>{
  const f=fixture(t);for(const markdown of ['', '\ud800','é'.repeat(MAX_DRAFT_BYTES/2+1),'a'.repeat(MAX_DRAFT_BYTES+1)])assert.throws(()=>f.checker.call('report_source_access_draft',{markdown}));
  const full=f.draft+'a'.repeat(MAX_DRAFT_BYTES-Buffer.byteLength(f.draft));
  assert.equal(f.checker.call('report_source_access_draft',{markdown:full}).receipt.utf8_bytes,MAX_DRAFT_BYTES);
});
test('literal shell syntax in text is never executed and receipt preserves Unicode and CRLF',t=>{
  const f=fixture(t), draft=f.draft.replaceAll('\n','\r\n')+'\r\n$(touch '+f.dir+'/SHOULD_NOT_EXIST) `whoami` αβγ\r\n';
  const result=f.checker.call('report_source_access_draft',{markdown:draft});
  assert.equal(result.pass,true);assert.equal(result.receipt.sha256,hash(draft));assert.equal(fs.existsSync(f.dir+'/SHOULD_NOT_EXIST'),false);
});
test('saved target rejects missing files, symlinks, directories, oversize and invalid UTF-8',t=>{
  const f=fixture(t);assert.throws(()=>f.checker.call('report_source_access_saved',{}));
  fs.symlinkSync(f.source,f.report);assert.throws(()=>f.checker.call('report_source_access_saved',{}));fs.unlinkSync(f.report);
  fs.mkdirSync(f.report);assert.throws(()=>f.checker.call('report_source_access_saved',{}));fs.rmdirSync(f.report);
  fs.writeFileSync(f.report,Buffer.alloc(MAX_DRAFT_BYTES+1));assert.throws(()=>f.checker.call('report_source_access_saved',{}));
  fs.writeFileSync(f.report,Buffer.from([0xff]));assert.throws(()=>f.checker.call('report_source_access_saved',{}));
});
test('changed directory aliases are rejected',t=>{
  const f=fixture(t);fs.mkdirSync(f.dir+'/a');fs.mkdirSync(f.dir+'/b');fs.symlinkSync(f.dir+'/a',f.dir+'/alias');
  const checker=createChecker(f.dir+'/alias/report.md');fs.unlinkSync(f.dir+'/alias');fs.symlinkSync(f.dir+'/b',f.dir+'/alias');
  assert.throws(()=>checker.call('report_source_access_draft',{markdown:f.draft}),/identity changed/);
});
test('directory replacement at the same path is rejected',t=>{
  const f=fixture(t);fs.mkdirSync(f.dir+'/reports');
  const checker=createChecker(f.dir+'/reports/report.md');
  fs.renameSync(f.dir+'/reports',f.dir+'/original-reports');fs.mkdirSync(f.dir+'/reports');
  assert.throws(()=>checker.call('report_source_access_draft',{markdown:f.draft}),/identity changed/);
});
test('stdio initializes, discovers tools, and returns validation failures as tool errors',async t=>{
  const f=fixture(t);const out=await exchange(f.checker,[req(0,'tools/list'),req(1,'initialize',{protocolVersion:'2025-06-18'}),req(2,'tools/list'),req(3,'tools/call',{name:'report_source_access_draft',arguments:{markdown:f.draft}}),req(4,'tools/call',{name:'report_source_access_draft',arguments:{markdown:'bad'}}),req(5,'tools/call',{name:'unknown',arguments:{}})]);
  assert.equal(out[0].error.code,-32002);assert.equal(out[1].result.protocolVersion,'2025-06-18');assert.equal(out[2].result.tools.length,2);
  assert.ok(out[2].result.tools.every(x=>x.annotations.readOnlyHint));assert.equal(out[3].result.isError,false);assert.equal(out[4].result.isError,true);assert.equal(out[5].result.isError,true);
});
test('transport rejects malformed, oversized and unterminated frames and recovers at newline',async t=>{
  const f=fixture(t);const out=await exchange(f.checker,['bad\n', 'x'.repeat(MAX_MESSAGE_BYTES), 'x', '\n', req(1,'ping'), '{}']);
  assert.equal(out.length,4);assert.equal(out[0].error.code,-32700);assert.match(out[1].error.message,/byte limit/);assert.deepEqual(out[2].result,{});assert.match(out[3].error.message,/Unterminated/);
});
test('split UTF-8 transport and no-response notifications preserve protocol framing',async t=>{
  const f=fixture(t), message=Buffer.from(req(1,'initialize')+req(undefined,'notifications/initialized')+req(2,'tools/call',{name:'report_source_access_draft',arguments:{markdown:f.draft+'\nα'}}));
  const index=message.indexOf(Buffer.from('α'))+1;const out=await exchange(f.checker,[message.subarray(0,index),message.subarray(index)]);
  assert.equal(out.length,2);assert.equal(out[1].result.isError,false);
});
test('actual process accepts a draft larger than the previously denied 33616-byte command',t=>{
  const f=fixture(t), markdown=f.draft+'\n'+'Text '.repeat(10000);
  const input=req(1,'initialize')+req(2,'tools/call',{name:'report_source_access_draft',arguments:{markdown}});
  const run=spawnSync(process.execPath,[path.resolve(import.meta.dirname,'../scripts/report-source-access-tool.mjs'),'--report',f.report],{input,encoding:'utf8',timeout:10000});
  assert.equal(run.status,0,run.stderr);assert.equal(run.stderr,'');const out=run.stdout.trim().split('\n').map(x=>JSON.parse(x));
  const result=JSON.parse(out[1].result.content[0].text);assert.equal(result.pass,true);assert.equal(result.receipt.sha256,hash(markdown));assert.equal(fs.existsSync(f.report),false);
});
