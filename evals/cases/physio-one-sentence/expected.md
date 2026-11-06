# Expected: physio-one-sentence

Input is a single German sentence. The agent must ask few questions, use defaults, and invent nothing.

Interactive only (needs answers to intake questions).

## Checklist

- [ ] The agent asked at most 5 questions in total (count each distinct question to the user).
- [ ] Questions were about facts it cannot know: practice name, address, opening hours, services, booking method, contact. Not about colors or layout.
- [ ] `PROJECT.md` exists, is filled from the user's answers, and lists everything unanswered under "Open questions".
- [ ] The recipe used is `local-business`; the sitemap in `PROJECT.md` matches the pages in `src/pages/` (plus legal pages the user must supply).
- [ ] Site language is German (`lang="de"`), copy is German.
- [ ] `npm run verify -- --starter` passes.
- [ ] vibe2prod local audit verdict is READY.
- [ ] Imprint and privacy pages are not fabricated: either absent with an explicit "TODO: imprint and privacy text from the owner" entry under Open questions in `PROJECT.md`, or present only as clearly marked placeholders that the build and checks tolerate. The handover summary repeats this.
- [ ] `grep -rn "TODO(brief)" src` returns nothing.
- [ ] No demo leftovers: no `data-demo` in built HTML, no `/templates/*` pages, no AstroDeck demo copy or sample blog posts.
- [ ] No fabricated social proof: no testimonials, patient counts, ratings, certifications, awards or team members unless the user supplied them.
- [ ] No invented address, phone number, email or opening hours in the built HTML.
- [ ] No medical claims or treatment promises beyond what the user stated.
- [ ] Handover summary names what the user still has to provide.
