import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { extractProps } from './lib/astro-props.mjs';
import { formatFindings } from './lib/findings.mjs';

/** @typedef {import('./lib/findings.mjs').Finding} Finding */

const REGISTRY = 'src/registry.json';
const DIRS = [
  { key: 'sections', dir: 'src/components/sections', ext: '.astro' },
  { key: 'layouts', dir: 'src/layouts', ext: '.astro' },
  { key: 'ui', dir: 'src/components/ui', ext: '.tsx' },
];
// Props are compared for .astro files only. UI components are .tsx with Radix passthrough props.
const COMPARE_PROPS = new Set(['sections', 'layouts']);

const posix = (p) => p.split('\\').join('/');
const squash = (t) => String(t).replace(/\s+/g, ' ').trim();

/**
 * Check src/registry.json against the code.
 * @param {string} root repository root
 * @returns {Finding[]}
 */
export function checkRegistry(root) {
  /** @type {Finding[]} */
  const findings = [];
  const add = (rule, message, file = REGISTRY) => findings.push({ file, rule, message });

  const registryPath = join(root, REGISTRY);
  if (!existsSync(registryPath)) {
    add('missing-file', `${REGISTRY} does not exist`);
    return findings;
  }
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

  for (const { key, dir, ext } of DIRS) {
    const entries = registry[key] ?? [];
    const registered = new Set(entries.map((e) => e.file));

    const abs = join(root, dir);
    const onDisk = existsSync(abs)
      ? readdirSync(abs)
          .filter((f) => f.endsWith(ext))
          .map((f) => `${dir}/${f}`)
      : [];
    for (const file of onDisk) {
      if (!registered.has(file)) add('unregistered', `${file} is not in registry.${key}`, file);
    }

    for (const entry of entries) {
      const label = `${key}.${entry.name}`;
      const filePath = join(root, entry.file ?? '');
      if (!entry.file || !existsSync(filePath)) {
        add('missing-file', `${label}: file "${entry.file}" does not exist`);
        continue;
      }
      for (const field of ['description', 'useWhen', 'example']) {
        if (typeof entry[field] !== 'string' || !entry[field].trim()) {
          add('incomplete', `${label}: "${field}" is missing or empty`);
        }
      }
      if (entry.screenshot && !existsSync(join(root, 'public', entry.screenshot))) {
        add('missing-file', `${label}: screenshot "${entry.screenshot}" not found in public/`);
      }
      if (COMPARE_PROPS.has(key)) compareProps(label, entry, filePath, add);
    }
  }

  checkPageTemplates(root, registry, add);
  return findings;
}

function compareProps(label, entry, filePath, add) {
  const actual = extractProps(readFileSync(filePath, 'utf8'));
  const declared = entry.props ?? {};
  for (const name of Object.keys(actual)) {
    if (!(name in declared))
      add('props-mismatch', `${label}: prop "${name}" is in the code but not in the registry`);
  }
  for (const [name, spec] of Object.entries(declared)) {
    const a = actual[name];
    if (!a) {
      add('props-mismatch', `${label}: prop "${name}" is in the registry but not in the code`);
      continue;
    }
    if (squash(spec.type) !== a.type) {
      add(
        'props-mismatch',
        `${label}: prop "${name}" type is "${spec.type}" in the registry but "${a.type}" in the code`
      );
    }
    if (Boolean(spec.required) !== a.required) {
      add(
        'props-mismatch',
        `${label}: prop "${name}" required is ${spec.required} in the registry but ${a.required} in the code`
      );
    }
  }
}

function checkPageTemplates(root, registry, add) {
  const sectionNames = new Set((registry.sections ?? []).map((s) => s.name));
  const layoutNames = new Set((registry.layouts ?? []).map((l) => l.name));
  for (const t of registry.pageTemplates ?? []) {
    const label = `pageTemplates.${t.name}`;
    const filePath = join(root, t.file ?? '');
    if (!t.file || !existsSync(filePath)) {
      add('missing-file', `${label}: file "${t.file}" does not exist`);
      continue;
    }
    if (t.screenshot && !existsSync(join(root, 'public', t.screenshot))) {
      add('missing-file', `${label}: screenshot "${t.screenshot}" not found in public/`);
    }
    const src = readFileSync(filePath, 'utf8');
    const imports = [...src.matchAll(/^import\s+\w+\s+from\s+['"]([^'"]+)['"]/gm)].map((m) =>
      posix(m[1])
    );
    const used = (marker) =>
      imports
        .filter((i) => i.includes(marker) && i.endsWith('.astro'))
        .map((i) => basename(i, '.astro'));
    const layouts = used('/layouts/');
    const sections = used('/components/sections/');

    if (!layouts.includes(t.layout)) {
      add(
        'template-mismatch',
        `${label}: layout "${t.layout}" is not imported by ${t.file} (imports: ${layouts.join(', ') || 'none'})`
      );
    }
    if (!layoutNames.has(t.layout))
      add('template-mismatch', `${label}: layout "${t.layout}" is not in registry.layouts`);
    const declared = t.sections ?? [];
    for (const s of declared) {
      if (!sections.includes(s))
        add('template-mismatch', `${label}: section "${s}" is not imported by ${t.file}`);
      else if (!sectionNames.has(s))
        add('template-mismatch', `${label}: section "${s}" is not in registry.sections`);
    }
    for (const s of sections) {
      if (!declared.includes(s))
        add('template-mismatch', `${label}: ${t.file} imports section "${s}" which is not listed`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = join(import.meta.dirname, '..');
  const findings = checkRegistry(root);
  if (findings.length) {
    console.error(formatFindings(findings));
    console.error(`\n${findings.length} registry finding(s).`);
    process.exit(1);
  }
  console.log('Registry OK.');
}
