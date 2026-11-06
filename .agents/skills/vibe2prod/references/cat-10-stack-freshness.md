# Category 10: Stack Freshness (live version check — no training knowledge)

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

**Critical rule:** Never answer "is this version current?" from training data. LLM training is 3–9 months stale and package release cadence is faster than that. Always fetch live version info from the sources below. If the live lookup fails (no network, registry 5xx), **abort Category 10 with a clear warning** rather than falling back to your memory.

Runs only in **Local Project Mode** (requires a `package.json`). In remote-URL mode, skip this category and note it in the report.

## Step 1: Detect stack

Read `package.json` and collect `dependencies` + `devDependencies`. Also read `.nvmrc`, `.node-version`, and `package.json#engines` for runtime version constraints. Classify against this reference set:

| Family | Packages to watch |
|---|---|
| Meta-frameworks | `next`, `nuxt`, `@remix-run/*`, `@sveltejs/kit`, `astro`, `gatsby`, `@solidjs/start`, `qwik`, `@builder.io/qwik-city` |
| Base frameworks | `react`, `react-dom`, `vue`, `svelte`, `solid-js`, `preact`, `@angular/core` |
| Styling | `tailwindcss`, `styled-components`, `@emotion/react`, `@stitches/react`, `@chakra-ui/react`, `@mantine/core`, `@radix-ui/themes` |
| Build tools | `vite`, `webpack`, `@rspack/core`, `esbuild`, `turbopack`, `parcel` |
| Language / types | `typescript`, `@types/node` |
| Runtime | `node` (from `engines`, `.nvmrc`, or `.node-version`) |

Packages not on this list are not flagged for *freshness* — vibe2prod is opinionated, not a generic `npm outdated` replacement. The *vulnerability* check (Step 3b) and the *dependency-integrity* check (Step 3c) are different: a known-exploited hole or a non-existent package matters wherever it sits, so those cover more than the watch list.

## Step 2: Resolve installed versions, then fetch registry data live

**Installed version** means the exact version that gets built — read it from the lockfile (`package-lock.json` → `packages["node_modules/<pkg>"].version`, or the `pnpm-lock.yaml` / `yarn.lock` / `bun.lock` entry), falling back to `node_modules/<pkg>/package.json`. Never use the range in `package.json`: `^18.2.0` says nothing about what is installed. If neither a lockfile nor `node_modules` exists, take the lowest version that satisfies the range and say so in the Notes column.

For each detected package, make two lookups:

```bash
# latest version plus the publish-time map (the abbreviated /latest manifest has no `time` field)
npm view "<pkg>" version time --json
# the INSTALLED version's own manifest — its `deprecated` field is what decides CRITICAL
npm view "<pkg>@<installed>" deprecated engines --json
```

Fallback without the npm CLI: `curl -sSL "https://registry.npmjs.org/<pkg>"` (full packument: `dist-tags.latest`, `time`, `versions["<installed>"].deprecated`). Do not use `/latest` for the deprecation check — it describes the newest release, not the one installed.

For Node itself, fetch the official release schedule:

```bash
curl -sSL "https://raw.githubusercontent.com/nodejs/Release/main/schedule.json"
# e.g. {"v18": {"start": "2022-04-19", "lts": "2022-10-25", "maintenance": "2023-10-18", "end": "2025-04-30", "codename": "Hydrogen"}, ...}
```

A Node line is **supported** when it has an `lts` key and `lts ≤ today < end`. Do not use `nodejs.org/dist/index.json` for this: its `lts` field carries the codename for every release that was *ever* LTS, end-of-life lines included, so Node 16 still reads as "Gallium". The LTS schedule changes annually — never guess it from training data.

If any registry call fails, output: `[Cat 10 skipped: live version lookup failed — refusing to use stale training data. Network issue? Retry later.]`

## Step 3: Classify each package

Compute the semver gap between installed and latest, and the age gap from `time[<installed>]` vs `time[<latest>]`:

| Condition | Severity |
|---|---|
| Same version, or only patch drift | **OK** (not reported as issue) |
| Minor behind (put the age gap in the Notes column) | **LOW** |
| One major version behind | **MEDIUM** |
| Two or more major versions behind | **HIGH** |
| Installed version carries a `deprecated` message on npm | **CRITICAL** |
| Node runtime line is not supported per `schedule.json` (past `end`, or never an LTS line) | **HIGH** |

## Step 3b: Known vulnerabilities (live, via OSV.dev)

Version age says nothing about security: an app one patch release behind can still ship a remotely exploitable hole (React2Shell, CVE-2025-55182, hit current React 19 / Next.js releases and was patched in point releases). Query OSV.dev for every package version in the lockfile:

```bash
# one query object per lockfile entry; ≤ 1000 per request, follow next_page_token
curl -sS -X POST "https://api.osv.dev/v1/querybatch" \
  -d '{"queries":[{"package":{"name":"next","ecosystem":"npm"},"version":"15.5.6"}, …]}'
# the batch response carries only IDs — fetch details per hit
curl -sS "https://api.osv.dev/v1/vulns/<id>"
```

Severity comes from the advisory, never from your own reading of it: use `database_specific.severity` (GitHub advisories: `CRITICAL` / `HIGH` / `MODERATE` → MEDIUM / `LOW`). If an advisory carries no such field, use **MEDIUM** and note "severity not provided". Packages marked `"dev": true` in the lockfile are capped at **LOW** — they do not ship to the browser or the server. Report one row per advisory with its ID, the installed version, and the first fixed version from `affected[].ranges[].events[].fixed`.

If OSV is unreachable, print `vulnerability check skipped — OSV.dev unreachable` and never say "no known vulnerabilities". A missing lockfile means only direct dependencies at their resolved versions can be checked — say so.

## Step 3c: Dependency integrity (hallucinated and squatted packages)

AI assistants sometimes invent package names, and attackers register those names once they are suggested often enough ("slopsquatting"). For each **direct** dependency in `package.json` that resolves from the npm registry (skip `git:`, `file:`, `workspace:`, `link:`, and URL specs):

```bash
npm view "<pkg>" name time.created --json        # E404 → does not exist on the configured registry
curl -sS "https://api.npmjs.org/downloads/point/last-week/<pkg>"
```

| Condition | Severity |
|---|---|
| Package does not exist on the configured registry (E404) | **CRITICAL** — the build only works from a stale cache or a private mirror; if it is meant to be private, the registry config is missing |
| Installed version is `0.0.1-security` (npm's placeholder after removing a malicious package) | **CRITICAL** |
| Package created < 30 days ago **and** < 1,000 downloads last week | **HIGH** — "very new, barely used: confirm this is the package you meant" |

Use the registry from the project's `.npmrc` when present — `npm view` does this automatically. Report the name and the evidence, never a verdict that the package is malicious.

## Step 4: Deprecated-API hint (optional, via a docs MCP)

For **MEDIUM** and **HIGH** findings on meta-frameworks (Next.js, Nuxt, Astro, SvelteKit, Remix), fetch the current migration guide link through a docs MCP such as Context7. Tool names differ between installs and versions (e.g. `resolve-library-id` plus `query-docs` or `get-library-docs`, under varying `mcp__…__` prefixes) — use whichever the session exposes:

1. Resolve the package name to the library identifier.
2. Query the docs for the migration guide between the installed and the latest major.
3. Include the migration URL in the finding. Do **not** paraphrase the migration guide — just link to it. That keeps the authoritative source the source.

If no docs MCP is connected, or the call errors, degrade gracefully: still report the version gap, omit the migration link. The version-gap finding never depends on the docs lookup.

## Report output

```
Stack Freshness (Cat 10)

Package              Installed    Latest      Gap            Severity  Notes
next                 12.3.4       15.1.2      3 major        HIGH      Migration: <url from Context7>
react                18.2.0       19.0.0      1 major        MEDIUM    Peer of next — bump together
tailwindcss          3.4.1        4.0.0       1 major        MEDIUM    v4 config format is new
typescript           5.3.3        5.7.2       minor (~4 mo)  LOW
vite                 5.4.8        5.4.11      patch          OK        (not listed)
node (engines)       18.x         22.x (LTS)  2 major        HIGH      Node 18 reached end-of-life 2025-04-30

Known vulnerabilities (OSV.dev, 412 lockfile entries checked)
Advisory              Package   Installed   Fixed in   Severity
GHSA-xxxx-xxxx-xxxx   next      15.5.6      15.5.7     CRITICAL   (CVE-2025-55182)

Dependency integrity (23 direct dependencies checked): 0 missing, 0 suspicious

Live lookup: npm registry (14 packages checked), nodejs/Release schedule.json (Node LTS schedule), OSV.dev
```

## Auto-fixes

- **Patch/minor bumps within the same major** → propose a `package.json` diff that updates the version range. Show the diff, wait for approval. Never run `npm install` without explicit user consent.
- **Major-version migrations** → never auto-apply. Output the migration guide link (fetched live via the docs MCP) and stop. Major upgrades ripple into breaking API changes and are not safe to automate.
- **Deprecated packages** → suggest replacements from the `deprecated` field's message (maintainers usually point to the successor package there).
- **Known vulnerabilities** → propose bumping to the first fixed version. Within the same major this is a normal version-range diff (show it, wait for approval); across a major it follows the major-migration rule above.
- **Missing or suspicious packages** → never auto-remove. Show the evidence and ask the user what the package was meant to be.
