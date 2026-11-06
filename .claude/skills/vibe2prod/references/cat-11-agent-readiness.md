# Category 11: Agent Readiness (report-only — never gated, never scored)

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Sites are increasingly read by agents, not only by people and classic crawlers: assistant browsing, LLM answer engines, MCP-driven automation. This category measures how legible the site is to them.

**Report-only, by design.** Cat 11 does **not** feed 2Prod — the gate set stays 5 vetos + 27 regular gates — and does **not** feed the Readiness Score, whose category weights are unchanged. Two reasons. (a) 2Prod answers *"can I publish this now?"*, and a missing `llms.txt` has never stopped anyone from publishing. (b) The underlying specs are months old and still moving — Google ships its own Lighthouse equivalent marked *experimental* — and gating on a moving spec would break exactly the cross-run comparability the **Stability rules** promise. Same precedent as the `xxl` breakpoint (report-only for gates) and the design-tell signals (informational).

Never render a Cat 11 result as a defect, and never attach a point value to it. These are opportunities, not findings.

Unlike Cat 10, this category runs in **both** modes. Every check works against a localhost prod server, so a local run and a remote run produce the same Cat 11 block.

## Checks

Every check reuses data the audit already collected — `page.html` from Cat 3, the 404 probe from Cat 7, the Playwright round from Cat 8/9 — plus at most three small `curl` calls. No new dependency.

| ID | Check | Measurement | Result |
|---|---|---|---|
| AR1 | `llms.txt` present | `GET <url>/llms.txt` returns HTTP 200 with a `text/*` content type | present / missing |
| AR2 | `llms.txt` well-formed | body has an `# ` H1, ≥ 1 Markdown link, and ≥ 50 non-whitespace characters | ok / malformed / n/a |
| AR3 | Content without JavaScript | strip `<script>`, `<style>`, and tags from the **raw** `page.html`: is an `<h1>` present in the raw body, and is there ≥ 500 characters of text? | pass / fail (+ char count) |
| AR4 | Agent-recoverable 404 | the Cat 7 404 probe: status is 404 **and** the body carries ≥ 1 internal `<a href>` and ≥ 100 characters of text | pass / fail |
| AR5 | Identity structured data | JSON-LD contains an identity node (`Organization`, `LocalBusiness`, `Person`, or `WebSite`) with non-empty `name`, `url`, `description`, `sameAs` | n/4 fields |
| AR6 | Markdown content negotiation | `curl -sI -H "Accept: text/markdown" <url>` returns `content-type: text/markdown` **and** a `Vary: Accept` header; if an `x-markdown-tokens` header is present (Cloudflare's *Markdown for Agents*), report its value | present / absent (bonus) |
| AR7 | WebMCP tools | **declarative**: count of `<form>` elements carrying both `toolname` and `tooldescription` attributes; **imperative**: in the Playwright round, whether `navigator.modelContext` exists and tools were registered on it (only observable in a Chrome build with WebMCP enabled — otherwise report "not observable") | n declarative / imperative present / absent (bonus) |

AR3 is the check with real weight here: it is the same raw-HTML measurement the **Static HTML rule** already applies to gates S6 and H1, and a CSR-only site that renders nothing without JavaScript is invisible to most agents *and* to a share of crawlers.

AR6 and AR7 are **bonus**. Their specs are young and absence is the norm — report them as "absent" with no implication that they should be present. WebMCP in particular is in a Chrome origin trial and its declarative attribute names are not yet in the spec text; they may still change.

## AI-crawler policy (neutral note — never a finding)

Read `robots.txt` and record which agent user-agents are disallowed: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`, `meta-externalagent`, `Meta-ExternalFetcher`, `Amazonbot`. Legacy tokens (`anthropic-ai`, `Claude-Web`) are no longer used by their operator — if `robots.txt` only blocks those, say so neutrally ("these tokens are deprecated; the current ones are …"), as a factual note, not a recommendation.

Also record any **content-usage signals**: `Content-Signal:` lines in `robots.txt` (Cloudflare's Content Signals Policy — `search`, `ai-input`, `ai-train`, each `yes`/`no`) and `Content-Usage` lines or headers (IETF AI Preferences drafts). Print the values as found.

State what you found and stop. Blocking AI crawlers is a **business decision**, not a defect — a paid-content site blocking them is doing the right thing. Phrase this exactly like the design-tell note: neutral, no severity, no point value, no fix item, never exported to `fix-me.md`. Never write "you should allow these" or "this hurts your reach".

## Optional: Lighthouse `agentic-browsing` passthrough

Google added an `agentic-browsing` category in **Lighthouse 13.3** (requires Chrome ≥ 150). It is marked experimental, and its score is not comparable to the other Lighthouse categories: its `llms-txt` audit returns `notApplicable` — not 0 — when the file is missing, and its three WebMCP audits are `notApplicable` for every site without WebMCP. For a normal site only two audits actually score, and both of them (`agent-accessibility-tree`, `cumulative-layout-shift`) are already measured here, by axe in Cat 2 and by gate P3.

So: if the Phase 1A version probe found Lighthouse ≥ 13.3, run

```bash
lighthouse "$url" --output=json --output-path=./lh-agentic.json --only-categories=agentic-browsing --chrome-flags="--headless --no-sandbox" --quiet
```

and report the per-audit results verbatim as an extra block labelled *"Lighthouse agentic-browsing (experimental)"*, showing `notApplicable` as `n/a`. Report the raw fraction Lighthouse gives, never a 0–100 score. If the installed Lighthouse is older, **omit the block silently** — do not mark it INCONCLUSIVE. This is optional enrichment, not a measurement the report depends on.

## Report output

```
Agent Readiness (Cat 11) — report-only, not part of 2Prod or the Readiness Score

AR1  llms.txt                  missing
AR2  llms.txt well-formed      n/a
AR3  Content without JS        ✓   h1 present, 2,140 chars in raw HTML
AR4  Agent-recoverable 404     ✗   404 status correct, but body has 0 internal links
AR5  Identity structured data  2/4 Organization: name ✓, url ✓, description ✗, sameAs ✗
AR6  Markdown negotiation      absent (bonus)
AR7  WebMCP annotations        absent (bonus)

AI-crawler policy: robots.txt disallows GPTBot, ClaudeBot. Content-Signal: search=yes,
ai-train=no. Neutral note — that is a business decision, not a defect.

Lighthouse agentic-browsing (experimental, LH 13.4.1):
  agent-accessibility-tree 1 · cumulative-layout-shift 1 · llms-txt n/a · webmcp-* n/a
```

## Fixes

Cat 11 items are fixed only on explicit request. They are never part of `--ship`'s autopilot pass — autopilot exists to flip 2Prod gates, and Cat 11 has none.

- **AR1 / AR2** — generate a starter `llms.txt` from the site's own title, meta description, and sitemap entries. Show it and wait for approval: it is public-facing copy.
- **AR4** — add internal recovery links to the 404 template.
- **AR5** — complete the existing identity JSON-LD block. Never invent `sameAs` profile URLs; ask the user for them.
- **AR3** — a CSR-only site failing AR3 needs SSR, SSG, or prerendering. Report it, link the framework's own docs, and stop. That is an architecture decision, not an audit fix.
