# Category 5: Security

> Reference file of the vibe2prod skill. The shared rules it relies on — *Working rules*, *Shared measurement rules*, the *Static HTML rule*, the gate tables, and the scoring methods — live in `SKILL.md`.

Check response headers and page content:

```bash
curl -sIL "$url" -o headers.txt
```

Parse `headers.txt` and check for:
- **HTTPS**: Is the URL using HTTPS? If HTTP (and not localhost), is there a redirect to HTTPS?
- **Security headers** (check presence and reasonable values):
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options`
  - `X-Content-Type-Options` (should be `nosniff`)
  - `Referrer-Policy`
  - `Permissions-Policy`
- **Cookie flags**: Any `Set-Cookie` headers should include `Secure`, `HttpOnly`, `SameSite`
- **Mixed content**: Scan `page.html` for any `http://` references to scripts, stylesheets, images, iframes
- **Public source maps**: from the Cat 8.5 collection — loaded scripts whose source map returns 200. Severity **LOW**.

Note: For local prod servers, security headers should still be reported as "missing" — they need to be configured at the hosting layer (Vercel, Netlify, Nginx, etc.) before ship.
