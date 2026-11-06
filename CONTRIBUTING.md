# Contributing to AstroDeck

Thank you for helping to improve AstroDeck. Bug reports, documentation fixes, new sections,
better skills and eval results from your coding agent are all welcome.

Please be respectful and constructive in all interactions.

## Setup

Requires Node.js >= 22.23.4, npm and Git.

```bash
git clone https://github.com/YOUR_USERNAME/astrodeck.git   # your fork
cd astrodeck
npm install
npm run dev                                                 # http://localhost:4321
git checkout -b fix/short-description
```

This repository is two things at once: the **astrodeck.dev demo and docs site** (deployed from
`main`) and the **starter** users download. Demo-only files are listed in
`starter.manifest.json`; `npm run starter:clean` removes them in a user's copy. Keep both states
working.

## Conventions

The rules for code, design and content live in one place: `AGENTS.md` (golden rules, commands,
Astro 7 / Tailwind 4 gotchas) and the references of the build-site skill:

- Design system (tokens, typography, spacing, radius, motion):
  `.agents/skills/astrodeck-build-site/references/design-system.md`
- Content rules (honest copy, links, alt text, metadata):
  `.agents/skills/astrodeck-build-site/references/content-rules.md`
- Quality checklist: `.agents/skills/astrodeck-build-site/references/quality-checklist.md`

They apply to human contributors as well. In short: semantic color tokens only, sections take
their content as props, every link and form goes somewhere real, no invented testimonials,
logos or numbers, one `h1` per page, light and dark mode, mobile first.

### Sections and the registry

- New or changed section: follow `.agents/skills/astrodeck-new-section/SKILL.md`, then update
  `src/registry.json` (props, `useWhen`, `example`). `npm run check:registry` compares it with the
  component.
- Icons come from `src/lib/icons.ts`; add new ones there.

### Skills and agent files

- Edit skills only in `.agents/skills/`, then run `npm run sync:agents`. `.claude/skills/` is a
  generated mirror; `npm run verify` fails on drift.
- Keep `AGENTS.md` a compact index (at most 250 lines): golden rules and task → skill routes.
  Details belong in a skill's `references/`.
- Skill front matter: only `name`, `description`, `license`, `compatibility`, `metadata`,
  `allowed-tools`; folder name equals `name`; body under 500 lines (`npm run lint:docs` checks).
- `.agents/skills/vibe2prod/` is vendored from upstream; never edit it by hand
  (`npm run sync:vibe2prod -- --tag vX.Y.Z` updates it).
- No symlinks anywhere: they do not survive ZIP extraction on Windows.
- How the layers fit together: `docs/maintainers/agent-layer.md`.

### Scripts

Scripts are ES modules in `scripts/` (shared helpers in `scripts/lib/`) with tests in `tests/`
(`node --test`). They use `node:path` APIs, work on Windows, and need no network access, except
`sync-vibe2prod.mjs` and `setup-audit.mjs`.

## Before you open a pull request

```bash
npm run verify
```

It must end with `VERIFY PASSED`. Fix the cause of a failure; do not add ignore markers or
delete rules or tests to get green. Also check your change in the browser at mobile and desktop
widths, in light and dark mode.

If you changed the build-site workflow or a skill, rerun at least one case from `evals/` with a
coding agent and mention the result in the pull request.

Maintainers: the release steps, including the check of the cleaned starter, are in
`docs/maintainers/release-checklist.md`.

## Pull requests

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org):
  `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`.
- One topic per pull request. Describe what changed, why, how you tested it, and add
  screenshots for visual changes. Link related issues (`Closes #42`).
- Update `README.md`, the docs page (`src/pages/docs.astro`) and `CHANGELOG.md` when behaviour
  or commands change. Every claim must be backed by the code.

## Reporting bugs

Search the [issues](https://github.com/holger1411/astrodeck/issues) first. A good report has:
steps to reproduce, expected and actual behaviour, screenshots if visual, and your environment
(OS, browser, Node version, AstroDeck version, coding agent and model if the bug is in the agent
workflow).

## Suggesting features

Open an [issue](https://github.com/holger1411/astrodeck/issues/new) with the use case, the
proposed solution and alternatives you considered. AstroDeck focuses on content and marketing
websites built with a coding agent; dashboards, app backends and CMS features are out of scope.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
