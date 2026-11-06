# Agent layer (maintainers)

How AstroDeck's instructions for coding agents are organized, and how to change them without
drift. Users never need this file; it is removed by `npm run starter:clean`.

## Layers

| Layer | Files | Loaded |
|-------|-------|--------|
| Index | `AGENTS.md` (≤ 250 lines, target ~200) | Always, by every supported tool |
| Brief | `PROJECT.md` (template in `.agents/skills/astrodeck-build-site/references/brief-template.md`, also `starter/PROJECT.md`) | Always (the index tells agents to read it) |
| Skills | `.agents/skills/<name>/SKILL.md` | On demand (auto-invoked by description, or opened via the index table) |
| References | `.agents/skills/<name>/references/**` | On demand, named by the skill body |
| Tool pointers | `CLAUDE.md`, `.github/copilot-instructions.md`, `.gemini/settings.json` | Per tool; no duplicated rules |
| Claude extras | `.claude/agents/astrodeck-reviewer.md`, `.claude/hooks/guard-conventions.mjs`, `.claude/settings.json` | Claude Code only, never required by the workflow |
| Mirror | `.claude/skills/**` | Generated copy of `.agents/skills/**` for Claude Code |
| Vendored | the vibe2prod skill in `.agents/skills/vibe2prod/` | Synced from upstream, never edited here |

Critical rules belong in `AGENTS.md`: skills are not always auto-invoked, so the index must name
the skill for each task and carry the golden rules.

## Skills

- Folder name == `name`, lowercase with hyphens, ≤ 64 characters; `description` ≤ 1024
  characters with the trigger phrases users actually say (English and German); body under 500
  lines; detail in `references/`.
- Front matter: only `name`, `description`, `license`, `compatibility`, `metadata`,
  `allowed-tools` (agentskills.io). Tool-specific fields break portability.
- `npm run lint:docs` enforces this (`skill-frontmatter` rule; vendored vibe2prod is skipped),
  plus dead paths, version and count drift in every doc.
- Current set: `astrodeck-build-site` (references: intake, brief-template, content-rules,
  design-system, quality-checklist, recipes), `astrodeck-new-page`, `astrodeck-new-section`,
  `astrodeck-theme` (references: fonts), `astrodeck-cleanup`.

## Mirror

Claude Code reads skills only from `.claude/skills/`; Codex, Cursor, Copilot, Gemini CLI and
Windsurf read `.agents/skills/`. The mirror is real files (symlinks do not survive ZIP
extraction on Windows).

- Edit `.agents/skills/`, then `npm run sync:agents` (`scripts/sync-agents.mjs`): copies every
  file, removes extraneous ones, writes `.claude/skills/README.md`.
- `npm run verify` runs `sync-agents --check` (step `agents-sync`) and fails on drift.
- Tests: `tests/sync-agents.test.mjs`.

## Changing the workflow

1. Edit the skill or reference in `.agents/skills/`.
2. If a rule changes, update `AGENTS.md` only when it is a golden rule or a task → skill route.
3. `npm run sync:agents`, then `npm run verify`.
4. Rerun an eval case (`evals/`) with at least one agent when the build-site workflow changes.

## Why the cleanup runs early

`npm run starter:clean` replaces `PROJECT.md`, `src/config/site.ts`, `src/config/site-url.mjs`,
`src/pages/index.astro`, `public/robots.txt` and `public/llms.txt`. The build-site workflow
therefore removes the demo right after intake (step 2), before the brief and config are written.

## Updating the vendored vibe2prod skill

`.agents/skills/vibe2prod/` is a copy of the upstream vibe2prod skill (MIT, by the same owner,
https://github.com/holger1411/vibe2prod). Never edit it by hand.

- Update (maintainers only, needs network and git): `npm run sync:vibe2prod -- --tag vX.Y.Z`.
  Without `--tag` the highest semver git tag is used. The script copies `skills/vibe2prod/`
  with symlinks resolved, adds the upstream `LICENSE`, writes `VERSION` (tag, commit, date) and
  runs `npm run sync:agents`.
- The vendored folder is excluded from Prettier, ESLint, TypeScript and the docs lint.
- License: the upstream `LICENSE` ships inside the folder and must stay there.
- Audit runtime: `npm run setup:audit -- --check` reports what is missing (exit 2), and
  `npm run setup:audit` installs only the missing pieces.
