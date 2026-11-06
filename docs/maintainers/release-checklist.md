# Release checklist

Run these from the repository root before every release. All commands must exit 0.

## 1. Demo (this repository)

```bash
npm run validate
npm run build
node scripts/check-dist.mjs
node scripts/check-registry.mjs
node scripts/lint-docs.mjs
npm run lint:design
npm test
```

## 2. Clean starter (what users get after `starter:clean`)

The ZIP ships the demo; the agent runs `npm run starter:clean`. Verify the result on a throwaway copy,
never in the repository itself:

```bash
T=$(mktemp -d)
rsync -a --exclude node_modules --exclude dist --exclude .git --exclude .superpowers --exclude .astro ./ "$T"/
cd "$T"
npm ci
npm run starter:clean -- --yes
npm run build
node scripts/check-dist.mjs --starter
npx astro check
node scripts/check-registry.mjs
node scripts/lint-docs.mjs
npm run lint:design
npm test
```

Repeat the second block with `npm run starter:clean -- --yes --keep-blog` on a fresh copy.

`starter:clean` options: `--dry-run` prints the plan, `--keep-blog` keeps the blog system and replaces the demo
posts with one draft post, `--yes` skips the confirmation (without it and without a TTY the command exits 2).
The manifest is `starter.manifest.json`, the replacement files live in `starter/`.
