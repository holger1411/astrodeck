# Supported coding agents

AstroDeck's agent layer is tool-agnostic: `AGENTS.md` is the always-loaded index and the skills
in `.agents/skills/` hold the workflows. Claude Code needs two extras, which the repo ships:
`CLAUDE.md` imports `AGENTS.md` (`@AGENTS.md`), and `.claude/skills/` is a generated copy of
`.agents/skills/` (`npm run sync:agents`, checked by `npm run verify`).

## Support matrix

Two statuses, kept honest:

- **tested end to end**: the 4.0 workflow was run with this tool on the eval cases in `evals/`
  (intake, `PROJECT.md`, cleanup, theme, pages, `npm run verify -- --starter`, vibe2prod) and
  ended with `VERIFY PASSED` and a vibe2prod Local 2Prod READY verdict (for Codex the
  maintainer ran the audit outside its sandbox, see the note below). Runs, versions and
  findings: `docs/maintainers/dogfood-4.0.md` (in the AstroDeck repository; `starter:clean`
  removes it from your copy).
- **documented**: the vendor's documentation says the tool reads `AGENTS.md` and Agent Skills
  by the open standards. The AstroDeck workflow was not run with it for 4.0.

Agents that do not load skills on their own still get the workflow, because `AGENTS.md` names
every skill file and tells the agent to open it.

| Tool | Reads `AGENTS.md` | Reads skills from | Status in 4.0 |
|------|-------------------|-------------------|---------------|
| Claude Code | via `CLAUDE.md` (`@AGENTS.md` import) | `.claude/skills/` (generated mirror) | tested end to end (CLI 2.1.319) |
| OpenAI Codex (CLI, IDE) | natively | `.agents/skills/` | tested end to end (CLI 0.155.1) |
| Cursor | natively | `.agents/skills/`, `.claude/skills/`, .cursor/skills/ | documented |
| GitHub Copilot (coding agent, VS Code agent mode) | natively; `.github/copilot-instructions.md` points to it | .github/skills/, `.claude/skills/`, `.agents/skills/` | documented |
| Gemini CLI | via `.gemini/settings.json` (`context.fileName: ["AGENTS.md"]`) | .gemini/skills/, `.agents/skills/` | documented |
| Windsurf (now documented as Devin Local) | natively | `.agents/skills/`, .windsurf/skills/, .devin/skills/ | documented |

Codex note: in the `workspace-write` sandbox Codex could not launch Chromium or keep a local
server running, so it could not run the vibe2prod browser checks itself. It said so and left the
audit to the owner; run `npm run setup:audit` and the audit outside the sandbox. Everything else,
including `npm run verify`, ran inside the sandbox.

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
- Codex: https://learn.chatgpt.com/docs/agent-configuration/agents-md, https://learn.chatgpt.com/docs/build-skills
- Cursor: https://cursor.com/docs
- GitHub Copilot: https://docs.github.com/en/copilot
- Gemini CLI: https://github.com/google-gemini/gemini-cli
- Windsurf / Devin Local: https://docs.devin.ai/desktop/cascade/agents-md, https://docs.devin.ai/desktop/cascade/skills
- AGENTS.md: https://agents.md · Agent Skills: https://agentskills.io
