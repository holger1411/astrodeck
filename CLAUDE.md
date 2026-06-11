# CLAUDE.md

This project follows the [AGENTS.md standard](https://agents.md).

1. Read **`AGENTS.md`** — all project conventions, patterns, and code standards.
2. Check **`PROJECT.md`** — project-specific customizations that **override** AGENTS.md defaults.

## AI layer quick reference

| What | Where |
|------|-------|
| Main agent (quality guardian) | `.claude/agents/astrodeck.md` |
| Multi-agent review | `/plenum` (`.claude/commands/plenum.md` + 6 review agents) |
| Commands | `/audit`, `/launch-check`, `/new-page`, `/new-section`, `/theme`, `/plenum` |
| Domain skills (KPIs + learnings) | `.claude/skills/` |
| Static convention checks | `npm run check:kpis` (single source of truth) |
| Convention guard hook | `.claude/hooks/guard-conventions.mjs` (auto-blocks deprecated patterns) |
| Canonical design decisions | `system/globals/` |
| Portable audit prompts (any AI tool) | `system/prompts/` |
