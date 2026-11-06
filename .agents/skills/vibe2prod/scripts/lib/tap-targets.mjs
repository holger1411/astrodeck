// WCAG 2.5.8 tap-target evaluation (SKILL.md → Cat 9, "Which tap targets are eligible").
// Input: raw targets collected in the page. Pure geometry, no DOM access.
//
// target = { i, selector, x, y, w, h, hidden: null | reason, inline: bool, related: [i, ...] }
//   hidden  — reason from the shared visually-hidden rule, or null
//   inline  — inside a sentence (WCAG 2.5.8 Inline exception)
//   related — indices of targets that contain or are contained by this one

const MIN_AA = 24;
const MIN_AAA = 44;
const RADIUS = MIN_AA / 2;

const center = (t) => ({ x: t.x + t.w / 2, y: t.y + t.h / 2 });

function circleHitsRect(c, r, t) {
  const nx = Math.max(t.x, Math.min(c.x, t.x + t.w));
  const ny = Math.max(t.y, Math.min(c.y, t.y + t.h));
  return (c.x - nx) ** 2 + (c.y - ny) ** 2 < r * r;
}

export function evaluateTapTargets(targets) {
  const visible = targets.filter((t) => !t.hidden);
  const undersized = visible.filter((t) => t.w < MIN_AA || t.h < MIN_AA);
  const inlineExcluded = undersized.filter((t) => t.inline);
  const candidates = undersized.filter((t) => !t.inline);

  // Spacing exception: a 24 px circle on the target's centre may not intersect another
  // target's box, nor another undersized target's circle.
  const spacingExcluded = [];
  const failing = [];
  for (const t of candidates) {
    const c = center(t);
    const related = new Set(t.related ?? []);
    const others = visible.filter((o) => o.i !== t.i && !related.has(o.i));
    const hitsBox = others.some((o) => circleHitsRect(c, RADIUS, o));
    const hitsCircle = undersized.some((o) => {
      if (o.i === t.i || related.has(o.i)) return false;
      const oc = center(o);
      return (c.x - oc.x) ** 2 + (c.y - oc.y) ** 2 < (2 * RADIUS) ** 2;
    });
    if (hitsBox || hitsCircle) failing.push(t); else spacingExcluded.push(t);
  }

  const aaaSet = visible.filter((t) => !t.inline);
  const aaaPassing = aaaSet.filter((t) => t.w >= MIN_AAA && t.h >= MIN_AAA).length;

  const hiddenByReason = {};
  for (const t of targets) if (t.hidden) hiddenByReason[t.hidden] = (hiddenByReason[t.hidden] ?? 0) + 1;

  return {
    raw: targets.length,
    excluded: {
      visually_hidden: hiddenByReason,
      inline: inlineExcluded.length,
      spacing: spacingExcluded.length,
    },
    undersized_raw: undersized.length,
    eligible_failing: failing.length,
    failing: failing.map((t) => ({ selector: t.selector, w: Math.round(t.w), h: Math.round(t.h) })),
    aaa: {
      eligible: aaaSet.length,
      passing: aaaPassing,
      pct: aaaSet.length ? Math.round((aaaPassing / aaaSet.length) * 1000) / 10 : 100,
    },
  };
}
