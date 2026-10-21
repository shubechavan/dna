# Who Owns Your DNA? · 3D presentation

**Personal DNA Data Ownership & Monetization Using Blockchain: Opportunities, Privacy Risks and Ethical Challenges**
MCA Semester III · Blockchain research · 7-minute talk for two presenters

A single cloud of 16,000 glowing particles changes shape for every slide: DNA helix → shattered helix → fingerprint →
data flowing to companies → orbiting objectives → 5-step pipeline → blocks arranged as a helix → privacy shield →
project network → glitching helix → galaxy → restored gold helix.

Built with React, Vite, Three.js (React Three Fiber) + postprocessing bloom, framer-motion and zustand.

## Run it

```bash
npm install
npm run dev        # open the printed localhost URL
npm run build      # static site in dist/ (deploy to Vercel / Netlify like before)
```

Everything (fonts, icons) is bundled, so it works **offline** once installed.

## Before presenting

Presenters are set in `src/config.ts`:

- **Presenter 1:** Shubham Chavan (Roll No. 17030925005), slides 1–6
- **Presenter 2:** Shubham Chaubey (Roll No. 17030925004), slides 7–12

The names appear on the title slide, the top-right speaker chip, the handover cue and the speaker notes.
Because both initials are "SC", the avatars show **1** and **2** instead (teal = Chavan, gold = Chaubey).

## Controls

| Key | Action |
| --- | --- |
| `→` `Space` `PageDown` | next slide (clickers work) |
| `←` `PageUp` | previous slide |
| `P` | open **presenter view** in a second window (notes, timers, pace) |
| `N` | toggle speaker notes on the main screen (for rehearsal) |
| `T` | toggle a small timer pill in the top bar |
| `F` | fullscreen |
| `D` | run the smart-contract demo automatically (slide 7) |
| `Home` / `End` | first / last slide |

You can also click the A-T-G-C letters at the bottom to jump to a slide. The progress bar spells
**ATG…TAG**, the start and stop codons of a gene.

### Presenter view
Press `P`, drag the new window to your laptop screen and keep the main window fullscreen on the projector.
Both windows stay in sync, so either one can advance the slides. The timer starts automatically when you leave the
title slide, and the **Pace** box tells you if you're ahead of or behind plan.

## Timing plan (7:00)

| # | Slide | Speaker | Time |
| --- | --- | --- | --- |
| 1 | Who owns your DNA? | A | 0:20 |
| 2 | Your DNA, sold for about $20 (23andMe story) | A | 0:40 |
| 3 | A password you can never change | A | 0:35 |
| 4 | Everyone profits, except you | A | 0:40 |
| 5 | Our research question | A | 0:25 |
| 6 | Our idea: your DNA stays locked, your rules go on the blockchain | A | 0:50 |
| 7 | Your rules, as code (**live demo**) | B | 0:45 |
| 8 | Blockchain doesn't hide data (privacy protections) | B | 0:35 |
| 9 | Who has tried this? (real companies) | B | 0:35 |
| 10 | Where it breaks (the problems) | B | 0:45 |
| 11 | India & future scope | B | 0:30 |
| 12 | The verdict + questions | B | 0:20 |
| 13 | Sources (backup) | – | – |

Presenter A: 3:30 · Presenter B: 3:30. A word-for-word script for each slide is in `src/slides.ts` (`notes`).

## Live demo tip (slide 7)
Click **Approve**: three entries appear in the blockchain record and the wallet counts up to 40 tokens.
Then click **Take back permission** to show the key limitation: no new access, but the lab keeps answers it already got.
Press `D` (or **Auto**) to play the whole sequence hands-free. It's an in-browser simulation; no real blockchain is involved.

## Project structure

```
src/
  config.ts            presenter names, course, brand
  slides.ts            slide order, timings, camera, 3D shape, speaker script
  three/shapes.ts      particle shape generators (helix, fingerprint, chain…)
  three/ParticleMorph  GPU morph between shapes
  three/Scene.tsx      camera rig, backdrop, dust, bloom
  content/             slide content (PartA = presenter A, PartB = presenter B, ContractDemo)
  ui/                  HUD, presenter view, keyboard handling
```
