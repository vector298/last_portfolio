# The Last Portfolio

> The Doomsday event has begun. Before everything goes offline, every survivor preserves their story.

The personal portfolio of **Ishaan Roy** ([@vector298](https://github.com/vector298)), built as a survivor's terminal: a digital archive that boots up, identifies its survivor, shows the tools they carry and the work they built, then opens a final transmission channel.

**Live:** https://vector298.github.io/last_portfolio/

## Sections

| # | Section | What it is |
|---|---------|------------|
| 01 | **Identity** | Hero with name, typewriter role, intro, interests and a scanning survivor ID card |
| 02 | **Survivor's Log** | Tabbed terminal of personal records (origin, education, interests, goals…). Missing records render as *corrupted sectors* |
| 03 | **Arsenal** | Skills grouped into filterable categories with 10-cell signal-strength meters, plus a live language scan of public repos |
| 04 | **Archives** | Project records with visuals, tech tags, links and an expandable dossier. Public GitHub repos are recovered live and get a generated visual |
| 05 | **Final Transmission** | Contact channels and a working command line (`help`, `projects`, `open 1`, `goto arsenal`, `email`…) |

Also: boot sequence (once per session, skippable), a HUD with active-section tracking, a blackout countdown, an emergency ticker, glitch and scan-line effects, keyboard support and `prefers-reduced-motion` support.

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies besides Google Fonts.

```
index.html          page structure
css/style.css       the whole visual system
js/data.js          ALL personal content: edit this file
js/main.js          rendering and interactions
assets/             favicon and project visuals
```

## Editing your content

Everything personal lives in [`js/data.js`](js/data.js). Any field left as `null` shows up on the site as a *redacted / data pending* block, so fill these in:

- `survivor.location`
- `log` entries for `EDUCATION`, `ACHIEVEMENTS`, `COMMUNITIES` and `OFF-GRID` (hobbies)
- `skills`: add or remove tools so the list matches what you actually know
- `projects`: add curated records with a screenshot in `assets/` (a template is in the file)
- `contact.linkedin` and `contact.other`

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

`.github/workflows/pages.yml` (at the repo root) publishes the `last_portfolio/` folder to GitHub Pages on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
