#!/usr/bin/env node
/**
 * AstroDeck convention guard (PreToolUse + PostToolUse hook for Write/Edit).
 *
 * PreToolUse  — hard-blocks changes that violate non-negotiable AstroDeck rules
 *               (deprecated Astro 6 patterns, tailwind.config.* creation).
 * PostToolUse — soft warnings for design-system drift (hardcoded colors,
 *               inline styles, relative imports). The edit goes through, but
 *               the assistant gets feedback and can self-correct.
 *
 * Exit codes follow the Claude Code hook contract:
 *   0 = OK, 2 = block / feed stderr back to the assistant.
 */

const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    process.exit(0); // never break the session on malformed input
  }

  const event = payload.hook_event_name || '';
  const input = payload.tool_input || {};
  const filePath = input.file_path || '';

  // Collect every piece of text this tool call writes
  const texts = [];
  if (typeof input.content === 'string') texts.push(input.content);
  if (typeof input.new_string === 'string') texts.push(input.new_string);
  if (Array.isArray(input.edits)) {
    for (const e of input.edits) {
      if (typeof e?.new_string === 'string') texts.push(e.new_string);
    }
  }
  const text = texts.join('\n');

  const inSrc = /\/src\//.test(filePath) || filePath.startsWith('src/');
  const isAstro = filePath.endsWith('.astro');
  const isTsx = filePath.endsWith('.tsx');
  const isGlobalsCss = /src\/styles\/globals\.css$/.test(filePath);
  const isContent = /src\/content\//.test(filePath);

  const block = (msg) => {
    process.stderr.write(msg + '\n');
    process.exit(2);
  };

  if (event === 'PreToolUse') {
    if (/tailwind\.config\.(js|cjs|mjs|ts)$/.test(filePath)) {
      block(
        'BLOCKED: AstroDeck uses Tailwind CSS v4 — there must be no tailwind.config.* file. ' +
          'Configuration lives in src/styles/globals.css via the @theme directive.'
      );
    }
    if (
      inSrc &&
      /import\s*\{[^}]*ViewTransitions[^}]*\}\s*from\s*['"]astro:transitions['"]/.test(text)
    ) {
      block(
        'BLOCKED: ViewTransitions is deprecated in Astro 6. ' +
          "Use: import { ClientRouter } from 'astro:transitions';"
      );
    }
    if (
      inSrc &&
      /import\s*\{[^}]*\bz\b[^}]*\}\s*from\s*['"]astro:(content|schema)['"]/.test(text)
    ) {
      block(
        "BLOCKED: importing z from 'astro:content' or 'astro:schema' breaks Content Collections in Astro 6. " +
          "Use: import { z } from 'astro/zod';"
      );
    }
    process.exit(0);
  }

  if (event === 'PostToolUse') {
    const warnings = [];

    if (inSrc && !isContent && (isAstro || isTsx)) {
      const colorRe =
        /\b(?:bg|text|border|ring|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/g;
      const colors = text.match(colorRe);
      if (colors) {
        warnings.push(
          `Hardcoded Tailwind color(s) ${[...new Set(colors)].join(', ')} — use semantic tokens instead ` +
            '(bg-primary, text-muted-foreground, ...). Hardcoded colors break theming and dark mode.'
        );
      }
    }
    if (inSrc && isAstro && /style="/.test(text)) {
      warnings.push(
        'Inline style attribute detected — use Tailwind utilities instead (design-system rule: 0 inline styles).'
      );
    }
    if (inSrc && /from\s+['"]\.\.\//.test(text)) {
      warnings.push(
        "Relative parent import ('../') detected — use the '@/' alias (refactoring-safe, AstroDeck convention)."
      );
    }
    if (isGlobalsCss && /(hsl\(|rgb\(|#[0-9a-fA-F]{3,8}\b)/.test(text)) {
      warnings.push(
        'Non-OKLCH color value in globals.css — all design tokens must use oklch(L% C H).'
      );
    }

    if (warnings.length > 0) {
      block(
        'AstroDeck convention warning for ' +
          (filePath || 'this change') +
          ':\n- ' +
          warnings.join('\n- ') +
          '\nPlease fix this now unless the user explicitly asked for an exception.'
      );
    }
    process.exit(0);
  }

  process.exit(0);
});
