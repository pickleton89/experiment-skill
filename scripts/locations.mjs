#!/usr/bin/env node
// Location contract v1. Dependency-free; never creates directories or writes records.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_PATHS = Object.freeze({documentation:'01-documentation',index:'01-documentation/INDEX.md',data:'03-data',results:'05-results',reports:'06-reports',findings:'06-reports/findings',publication:'07-publication'});
export const within = (root, target) => {
  const relative = path.relative(root,target);
  return relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative));
};
const object = x => x && typeof x === 'object' && !Array.isArray(x);
export function canonical(value, mustExist = true) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw Error('Location must be an absolute path');
  if (fs.existsSync(value)) return fs.realpathSync(value);
  if (mustExist) throw Error(`Configured location is unavailable: ${value}`);
  const parent = path.dirname(value);
  if (parent === value) throw Error(`Cannot resolve location: ${value}`);
  // lstat catches dangling links that existsSync treats as missing.
  try { if (fs.lstatSync(value).isSymbolicLink()) throw Error(`Dangling location alias: ${value}`); }
  catch (err) { if (err.code !== 'ENOENT') throw err; }
  return path.join(canonical(parent, false), path.basename(value));
}
function json(file) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!object(value)) throw Error(`Expected a JSON object: ${file}`);
  return value;
}
export function loadLocations(file) {
  const value = json(file);
  if (value.version !== 1 || !object(value.projects) || !Array.isArray(value.sync_roots)) throw Error('Host locations require version 1, projects and sync_roots');
  value.sync_roots.forEach(p => canonical(p, false));
  for (const [id, entry] of Object.entries(value.projects)) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !object(entry) || !object(entry.references)) throw Error('Invalid host project mapping');
    for (const key of ['research','code','work']) canonical(entry[key], false);
    Object.values(entry.references).forEach(p => canonical(p, false));
  }
  return value;
}
export function findProjectFile(start) {
  let dir = canonical(start);
  if (!fs.statSync(dir).isDirectory()) dir = path.dirname(dir);
  for (;;) {
    const file = path.join(dir, 'research-project.json');
    try { fs.lstatSync(file); return file; } catch (err) { if (err.code !== 'ENOENT') throw err; }
    // Do not inherit a different investigation's marker across these boundaries.
    if (fs.existsSync(path.join(dir,'WORK.md')) || fs.existsSync(path.join(dir,'.git'))) return null;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
export function resolveProject(start, {locations, projectFile, allowNewCode = false} = {}) {
  const host = locations ? loadLocations(locations) : null;
  let file = projectFile || findProjectFile(start);
  if (!file && host) {
    const here = canonical(start);
    const matches = Object.entries(host.projects).filter(([,entry]) => ['research','code'].some(k => within(canonical(entry[k],false),here)));
    if (matches.length > 1) throw Error('Ambiguous host project mapping');
    if (matches.length) file = path.join(matches[0][1].code,'research-project.json');
  }
  if (!file) return null; // Legacy discovery is allowed only without a marker/mapping.
  const spec = json(file);
  if (spec.location_version !== 1 || spec.layout !== 'split' || typeof spec.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(spec.id)) throw Error('Invalid split-project identity or location_version');
  if (!host?.projects[spec.id]) throw Error(`Explicit split project ${spec.id} requires a host mapping; no legacy fallback`);
  const entry = host.projects[spec.id], roots = {};
  for (const key of ['research','code','work']) {
    roots[key] = canonical(entry[key], !(allowNewCode && key === 'code'));
    if (fs.existsSync(roots[key]) && !fs.statSync(roots[key]).isDirectory()) throw Error(`${key} must be a directory`);
  }
  if (within(roots.research,roots.code) || within(roots.code,roots.research) || within(roots.research,roots.work) || within(roots.work,roots.research)) throw Error('Research must be separate from code and working storage');
  const record = path.join(roots.research,'WORK.md');
  if (fs.existsSync(record)) {
    const st = fs.lstatSync(record);
    if (!st.isFile() || st.isSymbolicLink() || st.size > 1024 * 1024) throw Error('Cannot verify mapped WORK.md identity');
    const content = new TextDecoder('utf-8',{fatal:true}).decode(fs.readFileSync(record));
    const front = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    const match = front?.match(/^id:\s*([^\r\n]+)$/m)?.[1];
    let id; try { id = JSON.parse(match); } catch { id = match?.replace(/^'(.*)'$/,'$1'); }
    if (id !== spec.id) throw Error('Mapped project ID differs from WORK.md ID');
  }
  for (const sync of host.sync_roots.map(p => canonical(p,false))) {
    if (within(sync,roots.code) || within(sync,roots.work)) throw Error('Code and working storage must be outside configured synchronization roots');
  }
  if (spec.paths !== undefined && !object(spec.paths)) throw Error('paths must be an object');
  const paths = {...DEFAULT_PATHS, ...spec.paths};
  for (const [key, relative] of Object.entries(paths)) {
    if (!(key in DEFAULT_PATHS) || typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(p => p === '..' || p === '.')) throw Error(`Invalid research-relative path: ${key}`);
    paths[key] = canonical(path.join(roots.research,relative),false);
    if (!within(roots.research,paths[key])) throw Error(`Research path escapes its root: ${key}`);
  }
  const requiredReferences = spec.references === undefined ? [] : spec.references;
  if (!Array.isArray(requiredReferences) || requiredReferences.some(x => typeof x !== 'string')) throw Error('references must list resource IDs');
  const references = {};
  for (const id of requiredReferences) {
    references[id] = canonical(entry.references[id]);
  }
  return {id:spec.id,layout:'split',project_file:path.resolve(file),...roots,record:path.join(roots.research,'WORK.md'),paths,references};
}
export function main(args = process.argv.slice(2)) {
  const opts = {}, names = {'--locations':'locations','--project-file':'projectFile'};
  let start = process.cwd();
  while (args.length) {
    const flag = args.shift();
    if (!args.length || args[0].startsWith('--')) throw Error(`Missing value for location option: ${flag}`);
    if (flag === '--start') start = args.shift();
    else if (flag in names) opts[names[flag]] = args.shift();
    else throw Error(`Unknown location option: ${flag}`);
  }
  const result = resolveProject(start,opts);
  console.log(JSON.stringify(result ?? {layout:'legacy',start:canonical(start)},null,2));
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (err) { console.error(err.message); process.exitCode=1; }
}
