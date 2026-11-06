# Expected: bakery-markdown-brief

Substantial briefing in `brief/` (copy `brief/` into the repo's `brief/` folder before the run).
It contains a conflict between two sources (opening hours and cake notice time: `briefing.md` vs
`notes-from-call.md`) and no testimonials.

## Checklist

- [ ] The agent read both files in `brief/` and did not ask for information already in them.
- [ ] At most 3 questions asked, and only about genuine gaps (e.g. photos, legal pages, map link). Information present in the briefing is not asked again.
- [ ] `PROJECT.md` "Open questions" lists the conflicts with both values and sources: opening hours (Saturday 14:00 vs 15:00, Sunday 11:30 vs 12:00, start 7:30 vs 8:00) and cake notice (2 vs 3 days). Acceptable handling: the agent asked, or it used the later source (`notes-from-call.md`, which says the door sign is outdated) and recorded that decision with both values in `PROJECT.md` Open questions or Decisions. Not acceptable: picking one value silently.
- [ ] The undecided "Friday late opening in summer" does not appear on the site.
- [ ] Sitemap equals the brief: Home, Products, Catering, About, Visit us. No blog, no shop, no login, no extra pages other than legal pages (imprint, privacy) as placeholders or user-supplied.
- [ ] Site language is German; copy is in Du-form, uses short sentences and no superlatives such as "best".
- [ ] "Baking since 2016" (German: "seit 2016") appears on the site.
- [ ] No Testimonials section and no review, rating or customer quote anywhere in the built HTML.
- [ ] No invented facts: no awards, no ingredient claims beyond the briefing, no team members other than Sabine and Jonas Brandt, no "thousands of customers".
- [ ] Contact data on the site equals the briefing (address, phone, email, Instagram); the fictional address is not "corrected" or replaced.
- [ ] Missing photos are not replaced by stock photos presented as real; no placeholder image services.
- [ ] `npm run verify -- --starter` passes.
- [ ] vibe2prod local audit verdict is READY. Imprint and privacy are not fabricated; missing legal text is listed as a TODO in `PROJECT.md` Open questions and in the handover.
- [ ] `grep -rn "TODO(brief)" src` returns nothing.
- [ ] No demo leftovers: no `data-demo` in built HTML, no `/templates/*` pages, no sample blog posts.
