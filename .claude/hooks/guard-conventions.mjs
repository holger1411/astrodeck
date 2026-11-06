#!/usr/bin/env node
/**
 * AstroDeck convention guard (PreToolUse + PostToolUse hook for Write/Edit/MultiEdit).
 *
 * The rules live in scripts/lib/rules.mjs and are shared with `npm run lint:design`.
 *
 * PreToolUse  - hard-blocks non-negotiable violations (tailwind.config.*,
 *               ViewTransitions, z from astro:content) before the edit happens.
 * PostToolUse - reports every other finding (palette colors, inline styles, ...)
 *               after the edit; the assistant can then self-correct.
 *
 * Exit codes follow the Claude Code hook contract: 0 = OK, 2 = block / feed
 * stderr back to the assistant.
 */
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const BLOCKING = new Set(['tailwind-config', 'view-transitions', 'zod-from-content']);

// Project root: CLAUDE_PROJECT_DIR, else two levels up from .claude/hooks (works in ZIP copies).
const root = resolve(process.env.CLAUDE_PROJECT_DIR || join(import.meta.dirname, '..', '..'));

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', async () => {
  let payload;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    process.exit(0); // never break the session on malformed input
  }

  try {
    const { lintText } = await import(
      pathToFileURL(join(root, 'scripts', 'lib', 'rules.mjs')).href
    );
    const { formatFindings } = await import(
      pathToFileURL(join(root, 'scripts', 'lib', 'findings.mjs')).href
    );

    const event = payload.hook_event_name || '';
    const input = payload.tool_input || {};
    const filePath = input.file_path || '';
    if (!filePath) process.exit(0);

    const abs = isAbsolute(filePath) ? filePath : resolve(root, filePath);
    const rel = relative(root, abs).split(sep).join('/');
    // Files outside the project are not ours to police.
    const path = rel.startsWith('..') ? filePath.split(sep).join('/') : rel;

    // Every piece of text this tool call writes
    const texts = [];
    if (typeof input.content === 'string') texts.push(input.content);
    if (typeof input.new_string === 'string') texts.push(input.new_string);
    if (Array.isArray(input.edits)) {
      for (const e of input.edits) if (typeof e?.new_string === 'string') texts.push(e.new_string);
    }
    let text = texts.join('\n');

    if (event === 'PostToolUse' && existsSync(abs)) {
      try {
        text = readFileSync(abs, 'utf8'); // full file after the write
      } catch {
        /* fall back to the written text */
      }
    }

    const findings = lintText(path, text);

    if (event === 'PreToolUse') {
      const blocked = findings.filter((f) => BLOCKING.has(f.rule));
      if (blocked.length) {
        process.stderr.write(`BLOCKED:\n${formatFindings(blocked)}\n`);
        process.exit(2);
      }
      process.exit(0);
    }

    if (event === 'PostToolUse' && findings.length) {
      process.stderr.write(
        `AstroDeck convention findings for ${path}:\n${formatFindings(findings)}\n` +
          'Please fix this now unless the user explicitly asked for an exception.\n'
      );
      process.exit(2);
    }
  } catch (err) {
    if (err && typeof err.code === 'number') throw err;
    process.exit(0); // never break the session on hook errors
  }
  process.exit(0);
});
