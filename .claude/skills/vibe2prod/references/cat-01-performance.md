# Category 1: Performance

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Run Lighthouse **3 times** and take the **median** per metric. Single-run perf scores jitter ±5–10 points between runs from network and CPU variance — the median is what makes the 2Prod gates and the Readiness Score reproducible. The median values feed both.

Median, not mean: a single timed-out or crashed run poisons the mean; the median is robust to one bad outlier.

```bash
for i in 1 2 3; do
  lighthouse "$url" --output=json --output-path=./lh-perf-$i.json --only-categories=performance --chrome-flags="--headless --no-sandbox" --quiet
done
```

**Retry policy:** for each of the 3 runs, the result must include all four required values:
- `categories.performance.score` (a number, not null)
- `audits["largest-contentful-paint"].numericValue`
- `audits["cumulative-layout-shift"].numericValue`
- `audits["total-blocking-time"].numericValue`

If a run produces a non-zero exit code, times out, or yields a JSON missing any of these fields, **retry that single run up to 2 additional times**. If after 3 attempts a run still fails, the entire Performance category in 2Prod is **hard-failed** (P1, P2, P3, P4 all counted as fails in the gate count). Do not silently fall back to fewer runs — that would hide instability and break project-independence.

Then take the **median** of each metric across the 3 successful runs:
- median `categories.performance.score`
- median LCP (ms)
- median CLS
- median TBT (ms)

Persist the medians to `./lh-perf-median.json` and treat that as the canonical Performance result everywhere downstream. In Phase 3, this median file is moved into `.vibe2prod/artifacts/<run>/` as a durable artifact; the three raw per-run files (`lh-perf-1/2/3.json`) are scratch and are cleaned up after the medians are computed.

If `PAGESPEED_API_KEY` is set and `url` is public (not localhost):
```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$url&key=$PAGESPEED_API_KEY&category=performance&strategy=mobile" -o psi-report.json
```

Extract and report:
- **Scores**: Performance score (0–100, median of 3 runs)
- **Core Web Vitals**: LCP (target < 2.5s), INP (target < 200ms — PSI/CrUX only, not measurable in lab), CLS (target < 0.1)
- **Other metrics**: TTFB, FCP, TBT
- **Issues**: Render-blocking resources, unoptimized images, unused CSS/JS, missing compression. Lighthouse 13 replaced most of the classic opportunity audits with *insight* audits (`render-blocking-insight`, `image-delivery-insight`, `document-latency-insight`, `lcp-discovery-insight`, …) and removed the old IDs from the JSON. Do not look up audits by a hard-coded ID list — take every audit in the `performance` category's `auditRefs` whose `score` is a number below 0.9, and report it by its own `title` and `id`.

**Cost**: triple-run perf adds ~2–4 minutes to the audit (more if retries trigger). This is intentional — the cost buys reproducibility. Do not skip the multi-run.
