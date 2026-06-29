# Claude Fable 5 — Birds

A self-contained, single-file HTML port of the **Birds** tab from Peter Ong's [_Claude Fable 5_](https://demo.peterong.dev/claude/) demo.

## Inspiration

This file is based entirely on Peter Ong's live demo at `https://demo.peterong.dev/claude/`, which compares Claude and ChatGPT-generated sumi-e style generative art. I extracted only the **Claude Fable 5 / Birds** scene — animated ink birds flocking over washi paper — and removed the model switcher, Koi/Savanna modes, and analytics scripts so it can run as a standalone page.

The visual style combines:

- Generative flocking / boids simulation
- Sumi-e ink brush rendering on HTML5 canvas
- Japanese typography (Zen Old Mincho + Cormorant Garamond)
- Washi paper grain, vignette, and a red hanko seal

## Run

Open directly in any modern browser:

```bash
open claude_fable5_birds_only.html
```

Or serve with Vite:

```bash
pnpm dev
# then visit http://localhost:5173
```

No build step or dependencies required for the standalone file.

## Controls

- **Move mouse** — lead the flock
- **Click / hold** — scatter the ink
- **T** — show/hide the flock tuner

## Notes

- The original demo dynamically switches between Birds, Koi, and Savanna. This file is hard-coded to **Birds only**.
- Fonts are loaded via Google Fonts through Cloudflare Fonts, so an internet connection is needed on first load.
