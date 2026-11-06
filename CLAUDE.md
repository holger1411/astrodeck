@AGENTS.md

## Claude Code only (optional extras; the workflow above works without them)

- `.claude/skills/` mirrors `.agents/skills/` via `npm run sync:agents`; edit the source. Add your own Claude-only skills directly in `.claude/skills/`: sync never touches folders it does not manage.
- Subagent `astrodeck-reviewer` (`.claude/agents/astrodeck-reviewer.md`): read-only review of a
  change against the design system and content rules, runs `npm run verify`.
- Hook `.claude/hooks/guard-conventions.mjs` blocks `tailwind.config.*`, `ViewTransitions` and
  `z` from `astro:content`, and reports other design-rule findings after each edit.
