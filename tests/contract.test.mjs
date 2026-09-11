import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {resolveProject} from '../scripts/locations.mjs';
const base=path.resolve(import.meta.dirname,'..');
const graph=fs.readFileSync(path.join(base,'docs/graph.md'),'utf8');
const block=s=>s.match(/<!-- location-contract-v1:start -->[\s\S]*?<!-- location-contract-v1:end -->/)[0];
const protocol=graph.match(/```\n(INDEX.md Update Protocol:[\s\S]*?)\n```/)[1];
for(const name of ['adopt','init','plan','capture','findings','report'])test(`${name} contains the canonical location protocol and expected lifecycle structure`,()=>{
 const text=fs.readFileSync(path.join(base,`.claude/commands/experiment-${name}.md`),'utf8');
 assert.equal(block(text),block(graph));
 assert.ok(text.startsWith('<!-- template-version: 1.0 -->\n<!-- Lifecycle:'));
 for(const needle of ['$ARGUMENTS','## Phase 0:','## Phase 1:','## Phase 2:','Do Not','Handling Incomplete Context']) assert.ok(text.includes(needle),needle);
 if(name!=='init')assert.ok(text.includes(protocol),'canonical index protocol copied verbatim');
});
test('Node launcher loads host JSON explicitly and agrees with direct API',t=>{
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'experiment-location-')));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const research=path.join(root,'research'), code=path.join(root,'code with space'),work=path.join(root,'work');[research,code,work].forEach(p=>fs.mkdirSync(p));
 fs.writeFileSync(path.join(code,'research-project.json'),JSON.stringify({location_version:1,id:'fixture',layout:'split'}));
 const locations=path.join(root,'host.json');fs.writeFileSync(locations,JSON.stringify({version:1,sync_roots:[research],projects:{fixture:{research,code,work,references:{}}}}));
 const result=spawnSync(process.execPath,[path.join(base,'scripts/locations.mjs'),'--start',code,'--locations',locations],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 assert.deepEqual(JSON.parse(result.stdout),resolveProject(code,{locations}));
 const bad=spawnSync(process.execPath,[path.join(base,'scripts/locations.mjs'),'--locations'],{encoding:'utf8'});
 assert.notEqual(bad.status,0);assert.match(bad.stderr,/Missing value/);
});
