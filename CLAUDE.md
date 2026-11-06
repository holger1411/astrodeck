@AGENTS.md

## Claude Code only (optional extras; the workflow above works without them)

- `.claude/skills/` is generated from `.agents/skills/` by `npm run sync:agents`; edit the source.
- Subagent `astrodeck-reviewer` (`.claude/agents/astrodeck-reviewer.md`): read-only review of a
  change against the design system and content rules, runs `npm run verify`.
- Hook `.claude/hooks/guard-conventions.mjs` blocks `tailwind.config.*`, `ViewTransitions` and
  `z` from `astro:content`, and reports other design-rule findings after each edit.
