# Evals

End-to-end cases that check the agent-first workflow: a coding agent receives a realistic
prompt (and optionally a `brief/` folder), follows `AGENTS.md` and the `astrodeck-build-site`
skill, and must produce a verified site.

**Maintainer-run, not part of `npm test`.** The cases need an agent and take minutes each.
This folder is removed by `npm run starter:clean`, so users never see it.

| Case | Tests |
|------|-------|
| `physio-one-sentence` | Low input: one German sentence. Few questions, sensible defaults, no invention. |
| `bakery-markdown-brief` | High input: Markdown briefing with a conflict between two sources and no testimonials. |
| `saas-design-md` | A `DESIGN.md` in `brief/` is applied to the theme; SaaS recipe without fabricated proof. |

Each case folder has `prompt.md` (the user's message), optional `brief/` (files for the
repo's `brief/` folder) and `expected.md` (objective pass criteria).

## Run a case

1. Make a fresh copy of the repository, without Git history and `node_modules`:
   `git archive --format=tar --prefix=eval/ HEAD | tar -x -C "$(mktemp -d)"` (or unzip a
   release ZIP), then `cd` into the copy.
2. `npm ci`.
3. Copy the case's `brief/` files into the copy's `brief/` folder, if the case has them.
4. Open the copy in the agent under test and give it the text of `prompt.md`.
   Interactive: paste the prompt. Headless, as a starting point (check your CLI's current
   options first, flags change between versions):
   `claude -p "$(cat evals/cases/<case>/prompt.md)"` or
   `codex exec "$(cat evals/cases/<case>/prompt.md)"`.
   Headless runs cannot answer questions; for cases that expect questions, run interactively
   or answer from the case's brief.
5. When the agent reports done, tick every item in the case's `expected.md`. Record agent,
   model, date, pass/fail per item and the number of questions asked.

Do not edit the repository between runs of different agents; start from a fresh copy each time.
