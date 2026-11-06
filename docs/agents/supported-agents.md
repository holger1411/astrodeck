# Supported coding agents

AstroDeck's agent layer is tool-agnostic: `AGENTS.md` is the always-loaded index and the skills
in `.agents/skills/` hold the workflows. Claude Code needs two extras, which the repo ships:
`CLAUDE.md` imports `AGENTS.md` (`@AGENTS.md`), and `.claude/skills/` is a generated copy of
`.agents/skills/` (`npm run sync:agents`, checked by `npm run verify`).

## Support matrix

"Documented" means the vendor's documentation says the tool reads these files; it is not a claim
that the AstroDeck workflow was run end to end with that tool. Agents that do not load skills
on their own still get the workflow, because `AGENTS.md` names every skill file and tells the
agent to open it.

| Tool | Reads `AGENTS.md` | Reads skills from | Status in 4.0 |
|------|-------------------|-------------------|---------------|
| Claude Code | via `CLAUDE.md` (`@AGENTS.md` import) | `.claude/skills/` (generated mirror) | documented |
| OpenAI Codex (CLI, IDE) | natively | `.agents/skills/` | documented |
| Cursor | natively | `.agents/skills/`, `.claude/skills/`, .cursor/skills/ | documented |
| GitHub Copilot (coding agent, VS Code agent mode) | natively; `.github/copilot-instructions.md` points to it | .github/skills/, `.claude/skills/`, `.agents/skills/` | documented |
| Gemini CLI | via `.gemini/settings.json` (`context.fileName: ["AGENTS.md"]`) | .gemini/skills/, `.agents/skills/` | documented |
| Windsurf (now documented as Devin Local) | natively | `.agents/skills/`, .windsurf/skills/, .devin/skills/ | documented |

Tools not listed may still work if they read `AGENTS.md`; they are not listed because their
support is not documented or not verified.

## Per-tool files in this repo

| File | Purpose |
|------|---------|
| `AGENTS.md` | The index every tool reads: rules, commands, task → skill table |
| `CLAUDE.md` | `@AGENTS.md` plus a few Claude-only notes |
| `.github/copilot-instructions.md` | Short pointer to `AGENTS.md` (Copilot Chat and code review) |
| `.gemini/settings.json` | Makes Gemini CLI load `AGENTS.md` as context |
| `.agents/skills/` | Canonical skills |
| `.claude/skills/` | Generated mirror for Claude Code (real files, no symlinks) |
| `.claude/agents/astrodeck-reviewer.md` | Optional Claude Code review subagent |
| `.claude/settings.json`, `.claude/hooks/` | Optional Claude Code hook (shared rules in `scripts/lib/rules.mjs`) |
| `.mcp.json` | MCP servers for Claude Code; other tools: `docs/agents/mcp-setup.md` |

There are deliberately no `.cursor/rules`, `.windsurfrules` or `.cursorrules` copies: those
tools read `AGENTS.md` directly, and duplicated rules drift.

## Vendor documentation

- Claude Code memory and skills: https://code.claude.com/docs/en/memory, https://code.claude.com/docs/en/skills
- Codex: https://developers.openai.com/codex
- Cursor: https://cursor.com/docs
- GitHub Copilot: https://docs.github.com/en/copilot
- Gemini CLI: https://github.com/google-gemini/gemini-cli
- Windsurf / Devin Local: https://docs.devin.ai/desktop/cascade/agents-md, https://docs.devin.ai/desktop/cascade/skills
- AGENTS.md: https://agents.md · Agent Skills: https://agentskills.io
