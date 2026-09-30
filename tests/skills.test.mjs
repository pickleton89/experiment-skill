import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DESCRIPTIONS, build, render } from '../scripts/build-skills.mjs';

const base = path.resolve(import.meta.dirname, '..');
const names = Object.keys(DESCRIPTIONS);

test('every command has a generated skill and none has drifted', () => {
  assert.equal(names.length, 6);
  assert.deepEqual(build({ base, check: true }), [], 'run node scripts/build-skills.mjs');
});

test('skills have the SKILL.md frontmatter hosts require', () => {
  for (const name of names) {
    const text = fs.readFileSync(path.join(base, 'skills', name, 'SKILL.md'), 'utf8');
    const front = text.match(/^---\nname: (.+)\ndescription: (.+)\n---\n/);
    assert.ok(front, `${name}: frontmatter must start at line 1`);
    assert.equal(front[1], name);
    assert.equal(JSON.parse(front[2]), DESCRIPTIONS[name]);
  }
});

test('skill bodies keep the command text unchanged, including the pinned protocol blocks', () => {
  for (const name of names) {
    const command = fs.readFileSync(path.join(base, '.claude/commands', `${name}.md`), 'utf8');
    const skill = fs.readFileSync(path.join(base, 'skills', name, 'SKILL.md'), 'utf8');
    assert.ok(skill.endsWith(command), `${name}: body differs from command`);
  }
});

test('render rejects an unregistered command instead of emitting a skill without a description', () => {
  assert.throws(() => render('experiment-unknown', 'x'), /No description/);
});

test('check mode reports drift without writing, and a build clears it', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-'));
  try {
    fs.mkdirSync(path.join(tmp, '.claude/commands'), { recursive: true });
    for (const name of names) fs.writeFileSync(path.join(tmp, '.claude/commands', `${name}.md`), `# ${name}\n`);
    assert.deepEqual(build({ base: tmp, check: true }), names);
    assert.equal(fs.existsSync(path.join(tmp, 'skills')), false, 'check mode must not write');
    assert.deepEqual(build({ base: tmp }), names);
    assert.deepEqual(build({ base: tmp, check: true }), []);
    fs.appendFileSync(path.join(tmp, '.claude/commands/experiment-plan.md'), 'edited\n');
    assert.deepEqual(build({ base: tmp, check: true }), ['experiment-plan']);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('CLI --check exits 0 on the committed repo', () => {
  const run = spawnSync(process.execPath, [path.join(base, 'scripts/build-skills.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
