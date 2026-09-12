import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {resolveProject} from '../scripts/locations.mjs';
test('nested work and marker-selected overlapping ownership',()=>{
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'home-contract-'))),code=root+'/local/Study with spaces',research=root+'/research/Study with spaces';
 for(const p of [code+'/04-analysis',code+'/02-scripts',research])fs.mkdirSync(p,{recursive:true});
 fs.writeFileSync(code+'/research-project.json',JSON.stringify({location_version:1,id:'study-id',layout:'split'}));
 const h={version:1,sync_roots:[root+'/research'],projects:{'study-id':{code,research,work:code+'/04-analysis',references:{}}}},locations=root+'/map.json';const save=()=>fs.writeFileSync(locations,JSON.stringify(h));save();
 assert.equal(resolveProject(code+'/02-scripts',{locations}).work,code+'/04-analysis');
 h.projects.other={...h.projects['study-id'],code:code+'/child'};save();
 assert.throws(()=>resolveProject(code,{locations}),/Ambiguous/);
 assert.equal(fs.existsSync(code+'/WORK.md'),false);
});
