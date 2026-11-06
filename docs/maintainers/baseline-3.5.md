# Baseline: AstroDeck 3.5.1 agent context

Measured on `release/4.0` before any 4.0 change (2026-11-06). Used for the 4.0 release-notes comparison.
Bytes via `wc -c`, lines via `wc -l`.

## Always-loaded entry path (Claude Code: CLAUDE.md -> AGENTS.md + PROJECT.md)

| File | Lines | Bytes |
|------|------:|------:|
| CLAUDE.md | 19 | 914 |
| AGENTS.md | 830 | 30,447 |
| PROJECT.md | 32 | 856 |
| **Total** | **881** | **32,217** |

## `.claude/` layer (loaded on demand or chained)

| Part | Lines | Bytes |
|------|------:|------:|
| Skills `SKILL.md` (7) | 750 | 23,989 |
| Skills `LEARNINGS.md` (6) | 50 | 3,687 |
| Agents (7) + commands (6), markdown | see total | see total |
| All agents + commands + skills markdown | 1,922 | 68,961 |
| Hook + KPI script + settings (not agent prose) | 334 | 11,121 |
| Entire `.claude/` directory | 2,256 | 80,099 |

Entry path plus all `.claude/` markdown: 2,803 lines, 101,178 bytes (approx. 25k tokens at 4 bytes/token). The plan estimated about 120 KB / 30k tokens; the measured value is lower.

## Per-tool convention copies

| Tool file | Lines | Bytes | Notes |
|-----------|------:|------:|-------|
| AGENTS.md | 830 | 30,447 | canonical |
| CLAUDE.md | 19 | 914 | pointer to AGENTS.md |
| .cursorrules | 830 | 30,447 | symlink to AGENTS.md (not a copy; violates the no-symlink rule) |
| .windsurfrules | 254 | 7,855 | hand-maintained copy |
| .cursor/rules | 165 | 5,984 | hand-maintained copy |
| .github/copilot-instructions.md | 351 | 9,801 | hand-maintained copy |

Convention files across tools: 6 (AGENTS.md, CLAUDE.md, .cursorrules, .windsurfrules, .cursor/rules, .github/copilot-instructions.md). Of these, 3 are hand-maintained divergent copies (.windsurfrules, .cursor/rules, copilot-instructions), 1 is a symlink, 1 is a pointer.
