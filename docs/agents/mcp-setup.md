# MCP servers (optional)

Two MCP servers help agents working on AstroDeck. Both are optional; nothing in the workflow
depends on them.

| Server | What it gives the agent | Transport |
|--------|-------------------------|-----------|
| `astro-docs` | Current Astro documentation (`https://mcp.docs.astro.build/mcp`) | HTTP |
| `shadcn` | shadcn/ui component search and install (`npx shadcn@latest mcp`) | stdio (needs Node) |

`.mcp.json` in the repo root declares both for Claude Code. Other tools use their own config
files; the values are the same.

## Claude Code

Claude Code reads the project's `.mcp.json` and asks you to approve the servers the first time.
Check with `claude mcp list` or `/mcp` in a session.
Docs: https://code.claude.com/docs/en/mcp

## Codex

Add to `~/.codex/config.toml` (or `.codex/config.toml` in a trusted project):

```toml
[mcp_servers.astro-docs]
url = "https://mcp.docs.astro.build/mcp"

[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

Or from the command line:

```bash
codex mcp add astro-docs --url https://mcp.docs.astro.build/mcp
codex mcp add shadcn -- npx shadcn@latest mcp
```

Docs: https://learn.chatgpt.com/docs/extend/mcp?surface=cli

## Cursor

Cursor reads `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global), not `.mcp.json`:

```json
{
  "mcpServers": {
    "astro-docs": { "url": "https://mcp.docs.astro.build/mcp" },
    "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] }
  }
}
```

Docs: https://cursor.com/docs/context/mcp

## VS Code (GitHub Copilot)

Use the "MCP: Add Server" command: choose HTTP with `https://mcp.docs.astro.build/mcp`, and
Command (stdio) with `npx shadcn@latest mcp`. VS Code's own `mcp.json` format uses a top-level
`servers` key, not `mcpServers`, so do not copy `.mcp.json` verbatim.
Docs: https://code.visualstudio.com/docs/copilot/customization/mcp-servers

## Other tools

Gemini CLI, Windsurf / Devin Local and others support MCP with their own config files; use the
two server definitions above and follow the vendor's MCP documentation.

## Optional: Vercel MCP

If you deploy to Vercel, the Vercel MCP server lets an agent inspect deployments and logs. It
needs your Vercel login and is not configured here. Docs: https://vercel.com/docs/mcp
