import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const base=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const enumValues=new Set(['pending','active','in-progress','complete','superseded']);
// These shipped templates deliberately use plain enum scalars. This is a narrow
// serialization check, not a general YAML parser or a substitute for app tests.
const status=s=>s.match(/^status:[ \t]*(.*)$/m)?.[1];
for(const name of ['adopt','plan','capture'])test(`${name} output template and worked example use clean status enums`,()=>{
 const command=read(`.claude/commands/experiment-${name}.md`);
 const template=command.split('````markdown\n')[1]?.split('````')[0];assert.ok(template);
 assert.ok(enumValues.has(status(template)),status(template));
 assert.ok(enumValues.has(status(read(`examples/${name}-example.md`))));
 assert.equal(enumValues.has('active  <!-- status values: pending | active -->'),false);
});
const graph=read('docs/graph.md');
const block=s=>s.match(/<!-- evidence-provenance-v1:start -->[\s\S]*?<!-- evidence-provenance-v1:end -->/)?.[0];
for(const name of ['adopt','plan','capture','findings','report'])test(`${name} preserves the canonical evidence ledger`,()=>{
 assert.ok(block(graph));assert.equal(block(read(`.claude/commands/experiment-${name}.md`)),block(graph));
});
test('location guidance is shared with the research-work package and contract document',()=>{
 const location=s=>s.match(/<!-- location-contract-v1:start -->[\s\S]*?<!-- location-contract-v1:end -->/)?.[0];
 assert.equal(location(read('docs/location-contract.md')),location(graph));
 const sibling=path.resolve(base,'../research-work');
 const researchWork=process.env.RESEARCH_WORK_SKILL || (fs.existsSync(sibling)
   ? sibling : path.join(os.homedir(),'.agents/skills/research-work'));
 assert.equal(location(fs.readFileSync(path.join(researchWork,'references/locations.md'),'utf8')),location(graph));
});

const closure=s=>s.match(/<!-- artifact-close-v1:start -->[\s\S]*?<!-- artifact-close-v1:end -->/)?.[0];
for(const name of ['adopt','plan','capture','findings','report'])test(name+' preserves the canonical saved-artifact gate',()=>{
 assert.ok(closure(graph));
 const command=read('.claude/commands/experiment-'+name+'.md');
 assert.equal(closure(command),closure(graph));
 assert.ok(command.indexOf('## Phase 2: Write and Register')<command.indexOf(closure(command)));
});

const delivery=s=>s.match(/<!-- final-delivery-v1:start -->[\s\S]*?<!-- final-delivery-v1:end -->/)?.[0];
for(const name of ['adopt','plan','capture','findings','report'])test(name+' preserves the final delivery gate beside its response step',()=>{
 const command=read('.claude/commands/experiment-'+name+'.md');
 assert.ok(delivery(graph));assert.equal(delivery(command),delivery(graph));
 const gateEnd=command.indexOf('<!-- final-delivery-v1:end -->');
 assert.ok(gateEnd>command.lastIndexOf('Target section:'));
 assert.match(command.slice(gateEnd),/^[\s\S]*?\d\. \*\*Report to user\.\*\* Print:/);
});
