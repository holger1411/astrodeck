# Copilot instructions — AstroDeck

All project instructions live in `AGENTS.md` at the repository root. Read it first, then
`PROJECT.md` (the site brief, which overrides `AGENTS.md`).

Skills for common tasks are in `.agents/skills/<name>/SKILL.md`:

- `astrodeck-build-site`: build a complete website from the user's brief
- `astrodeck-new-page`, `astrodeck-new-section`: add pages and sections
- `astrodeck-theme`: brand colors, fonts, radius
- `astrodeck-cleanup`: remove the demo content

Key rules (details in `AGENTS.md`): semantic color tokens only, content only from the brief
(never invented), brand and navigation only in `src/config/site.ts`, and every change ends with
`npm run verify` printing `VERIFY PASSED`.
