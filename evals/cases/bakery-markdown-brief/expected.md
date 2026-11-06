# Expected: bakery-markdown-brief

Substantial briefing in `brief/` (copy `brief/` into the repo's `brief/` folder before the run).
It contains a conflict between two sources (opening hours and cake notice time: `briefing.md` vs
`notes-from-call.md`) and no testimonials.

## Checklist

- [ ] The agent read both files in `brief/` and did not ask for information already in them.
- [ ] Questions asked: at most 5, all about real gaps (e.g. photos, legal pages, map link).
- [ ] `PROJECT.md` "Open questions" lists the conflicts with both values and sources: opening hours (Saturday 14:00 vs 15:00, Sunday 11:30 vs 12:00, start 7:30 vs 8:00) and cake notice (2 vs 3 days). The agent did not pick one silently; if the user was asked and answered, the answer is recorded.
- [ ] The undecided "Friday late opening in summer" does not appear on the site.
- [ ] Sitemap equals the brief: Home, Products, Catering, About, Visit us. No blog, no shop, no login, no extra pages other than legal pages (imprint, privacy) as placeholders or user-supplied.
- [ ] Site language is German; copy follows the tone notes (short sentences, no superlatives such as "best").
- [ ] No Testimonials section and no review, rating or customer quote anywhere in the built HTML.
- [ ] No invented facts: no awards, no ingredient claims beyond the briefing, no team members other than Sabine and Jonas Brandt, no "thousands of customers".
- [ ] Contact data on the site equals the briefing (address, phone, email, Instagram); the fictional address is not "corrected" or replaced.
- [ ] Missing photos are not replaced by stock photos presented as real; no placeholder image services.
- [ ] `npm run verify -- --starter` passes.
- [ ] vibe2prod local audit verdict is READY (or only user-supplied legal text remains and is listed in the handover).
- [ ] `grep -rn "TODO(brief)" dist` returns nothing; any `TODO(brief)` in `src/` is declared in Open questions.
- [ ] No demo leftovers: no `data-demo` in built HTML, no `/templates/*` pages, no sample blog posts.
