import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const base = path.resolve(import.meta.dirname, '..');
const json = p => JSON.parse(fs.readFileSync(path.join(base, p), 'utf8'));
const NAMES = ['adopt', 'init', 'plan', 'capture', 'findings', 'report'];

test('plugin manifest maps all six commands to existing files with descriptions', () => {
  const plugin = json('.claude-plugin/plugin.json');
  assert.equal(plugin.name, 'experiment-skill');
  assert.deepEqual(Object.keys(plugin.commands).sort(), NAMES.map(n => `experiment-${n}`).sort());
  for (const [name, entry] of Object.entries(plugin.commands)) {
    assert.match(entry.source, /^\.\//, `${name}: custom paths must start with ./`);
    assert.ok(fs.existsSync(path.join(base, entry.source)), `${name}: ${entry.source} missing`);
    assert.ok(entry.description?.length > 20, `${name}: description needed (line 1 of each command is a template-version comment)`);
  }
});

test('marketplace lists the plugin from the repo root with a matching version', () => {
  const plugin = json('.claude-plugin/plugin.json');
  const market = json('.claude-plugin/marketplace.json');
  assert.ok(market.owner?.name);
  const entry = market.plugins.find(p => p.name === plugin.name);
  assert.ok(entry, 'plugin entry present');
  assert.equal(entry.source, './');
  assert.equal(entry.version, plugin.version);
});

test('plugin version matches pyproject.toml', () => {
  const plugin = json('.claude-plugin/plugin.json');
  const py = fs.readFileSync(path.join(base, 'pyproject.toml'), 'utf8').match(/^version\s*=\s*"([^"]+)"/m)?.[1];
  assert.equal(plugin.version, py);
});

test('every command carries the plugin-root note and the scripts it names exist', () => {
  for (const n of NAMES) {
    const text = fs.readFileSync(path.join(base, `.claude/commands/experiment-${n}.md`), 'utf8');
    const note = text.indexOf('${CLAUDE_PLUGIN_ROOT}/scripts/');
    assert.ok(note > -1, `${n} missing plugin note`);
    assert.ok(note < text.indexOf('<!-- location-contract-v1:start -->'), `${n} note must precede the shared block`);
  }
  assert.ok(fs.existsSync(path.join(base, 'scripts/locations.mjs')));
});
