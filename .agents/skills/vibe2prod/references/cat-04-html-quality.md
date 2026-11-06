# Category 4: HTML Quality

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Validate HTML via W3C Nu Validator (skip if `url` is localhost — the validator can't reach it; instead pipe the local HTML):

```bash
# For remote URLs:
curl -s -H "Content-Type: text/html; charset=utf-8" --data-binary @page.html "https://validator.w3.org/nu/?out=json" -o w3c-report.json
```

**Split the messages before counting.** The Nu Validator bundles a CSS checker alongside the HTML parser, and its CSS property database lags shipped browser CSS by a long way — a page using a modern property can collect dozens of `error`-typed messages while its HTML is flawless. Sort every message into one of three buckets by its `message` string:

1. **HTML errors** — `type == "error"` and the message does **not** start with `CSS:`. This is the bucket gate **H1** counts, and the only one that can fail it. HTML validity is what H1 claims to measure; CSS validity never was.
2. **CSS vocabulary messages** — message starts with `CSS:` and matches an unknown-vocabulary complaint: `Property “…” doesn't exist`, `Unknown pseudo-element or pseudo-class`, `Unknown at-rule`. These are almost always validator lag rather than a defect. Report them as a single **informational** line with the count and the distinct property/selector names, never as a finding and never with a severity.
3. **Other CSS messages** — anything else starting with `CSS:` (parse errors, malformed values). Report as **LOW**: the browser drops the offending declaration, so it is a tidiness issue, not a ship blocker.

Never collapse buckets 2 and 3 into "31 errors". Print the split. A reader who sees `0 HTML errors · 31 CSS vocabulary messages (view-transition-name)` knows immediately that nothing is wrong with the page; a reader who sees `31 errors` goes looking for a defect that does not exist.

Extract and report:
- **HTML errors**: count and list (bucket 1)
- **CSS messages**: the bucket 2 count with distinct names, and the bucket 3 list
- **Warnings**: count and list `type != "error"` messages
- **Semantic issues**: Missing landmarks, incorrect heading nesting
