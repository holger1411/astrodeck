/**
 * Demo-only (astrodeck.dev): counts shown on the home and docs pages, computed at build time
 * from src/registry.json and .agents/skills/ so they can never drift from the code.
 * Fails the build instead of showing a wrong number (missing folder, zero count).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import registry from '@/registry.json';

/** Walk up from `start` to the first folder that holds package.json and .agents/skills. */
function findUp(start: string): string | undefined {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, '.agents', 'skills')))
      return dir;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

/** Repo root: from this module's location (dev) or the working directory (bundled build). */
const root =
  findUp(dirname(fileURLToPath(import.meta.url))) ??
  findUp(process.cwd()) ??
  (() => {
    throw new Error('kit-stats: repo root with .agents/skills not found');
  })();

const skillsDir = join(root, '.agents', 'skills');
const recipesDir = join(skillsDir, 'astrodeck-build-site', 'references', 'recipes');

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(dir, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

function listRecipes(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

/** Skill folder names in .agents/skills (AstroDeck skills plus the bundled vibe2prod). */
export const skills = listDirs(skillsDir);
/** Site-type recipe names of the build-site workflow, e.g. 'saas'. */
export const recipes = listRecipes(recipesDir);

/** Tag of the bundled vibe2prod skill, e.g. 'v0.9.1' (from its VERSION file). */
export const vibe2prodVersion = (() => {
  const file = join(skillsDir, 'vibe2prod', 'VERSION');
  const tag = existsSync(file)
    ? readFileSync(file, 'utf8')
        .match(/^tag=(.+)$/m)?.[1]
        ?.trim()
    : undefined;
  if (!tag) throw new Error(`kit-stats: no tag= line in ${file}`);
  return tag;
})();

export const kitStats = {
  sections: registry.sections.length,
  ui: registry.ui.length,
  layouts: registry.layouts.length,
  skills: skills.length,
  recipes: recipes.length,
};

for (const [name, count] of Object.entries(kitStats)) {
  if (!count) throw new Error(`kit-stats: ${name} count is 0, check ${root}`);
}
