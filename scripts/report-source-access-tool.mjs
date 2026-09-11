import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {validateSourceAccess} from './report-source-access.mjs';

// Session-only read-only adapter. No shell, writes, network or dependencies.
export const MAX_DRAFT_BYTES = 1024 * 1024;
// JSON can expand a character into six ASCII bytes (for example, \u0000).
export const MAX_MESSAGE_BYTES = MAX_DRAFT_BYTES * 6 + 4096;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => object(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
const schema = properties => ({type:'object', properties, required:Object.keys(properties), additionalProperties:false});
const annotations = {readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false};
export const TOOLS = [
  {name:'report_source_access_draft', description:'Validate the complete unsaved report text before its first write. Returns a hash of exactly the supplied UTF-8 text. Checks source-table structure and local file metadata only.', inputSchema:schema({markdown:{type:'string', minLength:1, maxLength:MAX_DRAFT_BYTES}}), annotations},
  {name:'report_source_access_saved', description:'Read and validate the one report path fixed at server startup, after the final edit and complete readback and before registration. Returns the checked file hash. Does not write or register anything.', inputSchema:schema({}), annotations},
];

export function createChecker(report) {
  if (typeof report !== 'string' || !path.isAbsolute(report) || !report.endsWith('.md')) throw new Error('An absolute .md report path is required');
  const target = path.resolve(report), baseDir = path.dirname(target);
  const canonicalDirectory = fs.realpathSync(baseDir);
  const directoryIdentity = fs.statSync(canonicalDirectory);
  if (!directoryIdentity.isDirectory()) throw new Error('Report parent must be an existing directory');
  const checkDirectory = () => {
    const current = fs.statSync(baseDir);
    if (fs.realpathSync(baseDir) !== canonicalDirectory || current.dev !== directoryIdentity.dev || current.ino !== directoryIdentity.ino) throw new Error('Report directory identity changed');
  };
  const validate = (bytes, mode) => {
    if (!bytes.length || bytes.length > MAX_DRAFT_BYTES) throw new Error('Report must be between 1 and 1048576 UTF-8 bytes');
    const markdown = new TextDecoder('utf-8', {fatal:true, ignoreBOM:true}).decode(bytes);
    const result = validateSourceAccess(markdown, {baseDir});
    return {...result, receipt:{mode, report:target, base_directory:baseDir, utf8_bytes:bytes.length, sha256:digest(bytes)}, limitations:'Structure and local source-file metadata only. Does not establish actual source reads, complete source coverage, source hashes, mapped-root containment, scientific accuracy or registration.'};
  };
  return {
    call(name, args) {
      checkDirectory();
      if (name === 'report_source_access_draft') {
        if (!exactKeys(args, ['markdown']) || typeof args.markdown !== 'string') throw new Error('Draft requires only a markdown string');
        // Reject unpaired surrogates rather than silently replacing the supplied text.
        if (!args.markdown.isWellFormed()) throw new Error('Draft must contain valid Unicode');
        return validate(Buffer.from(args.markdown, 'utf8'), 'draft');
      }
      if (name !== 'report_source_access_saved') throw new Error('Unknown tool');
      if (!exactKeys(args, [])) throw new Error('Saved check accepts an empty object only');
      // O_NONBLOCK prevents a substituted FIFO from hanging; O_NOFOLLOW rejects
      // a final symlink. Open the remembered real directory, not a replaced alias.
      const file = path.join(canonicalDirectory, path.basename(target));
      const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
      try {
        const before = fs.fstatSync(fd);
        if (!before.isFile() || before.size < 1 || before.size > MAX_DRAFT_BYTES) throw new Error('Saved report must be a regular file of 1 to 1048576 bytes');
        const buffer = Buffer.alloc(MAX_DRAFT_BYTES + 1);
        let length = 0, read;
        while (length < buffer.length && (read = fs.readSync(fd, buffer, length, buffer.length - length, null)) > 0) length += read;
        const after = fs.fstatSync(fd), current = fs.lstatSync(file);
        checkDirectory();
        if (current.isSymbolicLink() || current.dev !== before.dev || current.ino !== before.ino || after.size !== before.size || length !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs) throw new Error('Saved report changed during the read');
        return validate(buffer.subarray(0, length), 'saved');
      } finally { fs.closeSync(fd); }
    },
  };
}

export async function serve(checker, input = process.stdin, output = process.stdout) {
  let initialized = false, pending = Buffer.alloc(0), dropping = false;
  const send = value => output.write(JSON.stringify(value) + '\n');
  const error = (id, code, message) => send({jsonrpc:'2.0', id, error:{code, message}});
  const message = bytes => {
    let request;
    try { request = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes)); }
    catch { error(null, -32700, 'Invalid JSON message'); return; }
    if (!object(request) || request.jsonrpc !== '2.0' || typeof request.method !== 'string' || (request.id !== undefined && !(typeof request.id === 'string' || (typeof request.id === 'number' && Number.isFinite(request.id))))) { error(null, -32600, 'Invalid request'); return; }
    if (request.id === undefined) return;
    let result;
    if (request.method === 'initialize') {
      initialized = true;
      const versions = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
      result = {protocolVersion:versions.includes(request.params?.protocolVersion) ? request.params.protocolVersion : versions[0], capabilities:{tools:{}}, serverInfo:{name:'report-source-access',version:'1.0.0'}, instructions:'Read-only source-table gates. Draft tool accepts complete text; saved tool reads only the configured report. Require pass:true, no issues, nonempty rows and matching receipt hash. These tools never save, register, or establish provenance claims.'};
    } else if (request.method === 'ping') result = {};
    else if (!initialized) { error(request.id, -32002, 'Initialize first'); return; }
    else if (request.method === 'tools/list') result = {tools:TOOLS};
    else if (request.method === 'tools/call') {
      try {
        const data = checker.call(request.params?.name, request.params?.arguments ?? {});
        result = {content:[{type:'text',text:JSON.stringify(data)}], isError:!data.pass};
      } catch (err) { result = {content:[{type:'text',text:JSON.stringify({pass:false,issues:[{code:'INPUT_ERROR',detail:err.message}]})}],isError:true}; }
    } else { error(request.id, -32601, 'Method not found'); return; }
    send({jsonrpc:'2.0', id:request.id, result});
  };
  // Bound buffering before JSON parsing, even for streams without a newline.
  for await (const chunk of input) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    let offset = 0;
    while (offset < bytes.length) {
      const end = bytes.indexOf(10, offset), stop = end < 0 ? bytes.length : end;
      const part = bytes.subarray(offset, stop);
      if (!dropping) {
        if (pending.length + part.length > MAX_MESSAGE_BYTES) { pending = Buffer.alloc(0); dropping = true; error(null, -32700, 'Message exceeds byte limit'); }
        else pending = Buffer.concat([pending, part]);
      }
      if (end >= 0) { if (!dropping && pending.length) message(pending); pending = Buffer.alloc(0); dropping = false; }
      offset = end < 0 ? bytes.length : end + 1;
    }
  }
  if (!dropping && pending.length) error(null, -32700, 'Unterminated JSON message');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--report') throw new Error('Usage: node report-source-access-tool.mjs --report /absolute/report.md');
    await serve(createChecker(process.argv[3]));
  } catch (err) { process.stderr.write(err.message + '\n'); process.exitCode = 2; }
}
