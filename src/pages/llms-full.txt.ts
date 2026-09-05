import type { APIRoute } from 'astro';
// Vite ?raw imports inline the file contents at build time
import agents from '/AGENTS.md?raw';
import readme from '/README.md?raw';

/**
 * /llms-full.txt — the complete project documentation as plain text for LLMs.
 * Built from AGENTS.md and README.md at build time, so it never drifts from
 * the files AI assistants and humans actually read.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://astrodeck.dev')).origin;

  const body = [
    '# AstroDeck — full documentation for LLMs',
    '',
    `Short index: ${origin}/llms.txt`,
    `Live docs: ${origin}/docs`,
    `Source: https://github.com/holger1411/astrodeck`,
    '',
    '---',
    '',
    '# Part 1: AGENTS.md (conventions for AI coding assistants)',
    '',
    agents.trim(),
    '',
    '---',
    '',
    '# Part 2: README.md (human documentation)',
    '',
    readme.trim(),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
