/**
 * Demo-only (astrodeck.dev): counts shown on the home and docs pages, computed at build time
 * from src/registry.json and .agents/skills/ so they can never drift from the code.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import registry from '@/registry.json';

const skillsDir = join(process.cwd(), '.agents', 'skills');
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
  if (!existsSync(file)) return '';
  return (
    readFileSync(file, 'utf8')
      .match(/^tag=(.+)$/m)?.[1]
      .trim() ?? ''
  );
})();

export const kitStats = {
  sections: registry.sections.length,
  ui: registry.ui.length,
  layouts: registry.layouts.length,
  skills: skills.length,
  recipes: recipes.length,
};
