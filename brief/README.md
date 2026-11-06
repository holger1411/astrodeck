# brief/ — drop your material here

Put anything that describes the website you want into this folder, then tell your coding agent
"Build my website from the brief". It reads everything here, asks about what is missing, and
writes a structured brief to `PROJECT.md`.

You do not need all of this. One sentence in the chat is enough to start; more material means
fewer questions and a closer first result.

| What | Examples |
|------|----------|
| Text about the business or project | `about.md`, `services.txt`, a company profile PDF, an old flyer |
| Content for pages | page texts, opening hours, prices, team bios, FAQs, customer quotes (with permission) |
| Design | `DESIGN.md` (Google Labs DESIGN.md format with color tokens), brand guidelines PDF, logo files (SVG preferred), fonts with a web licence |
| Images | photos you own or may use, with a short note on what each shows |
| Links | `links.md` with your current website, social profiles, a design system or sites you like and why |

Good to know:

- The agent uses only facts from your material and your answers. It does not invent reviews,
  customer logos, numbers or team members; gaps are listed as open questions in `PROJECT.md`.
- A `DESIGN.md` here can be applied directly: `npm run theme -- --from brief/DESIGN.md`.
- Files in this folder are inputs, not part of the website. Images you want on the site are
  copied to `public/` or `src/` by the agent.
- Do not put passwords or private keys here. If the project is a public Git repository, this
  folder is public too.
