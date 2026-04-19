# transload — animated landing page

Static, single-page React landing site for transload. No build step — JSX is transpiled in the browser via Babel Standalone. Just serve the directory.

---

## Run locally

Any static server works. From the repo root:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

No `npm install`, no bundler. If you edit a JSX file, hard-reload the browser (Cmd+Shift+R) — Python's `http.server` doesn't set no-cache headers, so regular reload may serve stale files.

---

## Repository layout

```
animated-landing-page/
├── index.html           # Entry point — loads React, Babel, Three.js, scene data, and all src/*.jsx
├── src/
│   ├── App.jsx          # Root component, scroll state, section composition, top-level styling
│   ├── Header.jsx       # Fixed glassy top nav ("Installation", "Comparison", "Demo", "Phone", "Contact")
│   ├── PointCloud.jsx   # Three.js scene: photo-to-point-cloud scroll transition
│   ├── Comparison.jsx   # "What changes with transload" past-vs-now (default, V2: cinematic side-by-side + bridge arrow)
│   ├── ComparisonV3.jsx # Alternative variant — interactive past/now tab toggle with auto-advance. Opt-in via ?comparison=v3
│   ├── i18n.js          # EN/DE string tables, language detect/set, useT() hook. ?lang=de toggles
│   ├── BookDemo.jsx     # Cal.com embed (inline scheduler)
│   └── Tweaks.jsx       # In-page tweaks panel (accent color, point size, bg, transition mode)
├── assets/
│   ├── warehouse.png    # Hero background photo; also sampled by the point cloud for per-point color
│   ├── scene.js         # Base64-encoded point-cloud binary (window.__SCENE_B64) — see "Scene data"
│   ├── past-dimensioner.png  # "The past" comparison image
│   ├── now-highlighted.png   # "Now" comparison image (highlighted items in orange)
│   ├── logo-default.png      # Header logo (also logo-black / logo-inverted variants)
│   ├── yc-logo.png / .svg    # Unused spares (actual YC badges live in partners/)
│   └── partners/             # Trusted-by marquee logos (see "Partner banner" below)
└── README.md            # This file
```

---

## Page sections (top to bottom)

Every section lives in `src/App.jsx` unless noted.

| Section | File / lines | Notes |
|---|---|---|
| Header | `src/Header.jsx` | Fixed, glass morphism; `scrolled` prop triggers a subtle state change |
| Hero / scroll scene | `src/App.jsx:74-302` + `src/PointCloud.jsx` | 160vh sticky section; scroll progress 0→1 drives the photo-to-point-cloud transition |
| Per-item dimension chips | `src/App.jsx:304-344` | Three chips (front / mid / back), positioned next to items; fade in at `progress >= 0.5`, fade out at `progress >= 0.8` |
| Partner banner ("Trusted by") | `src/App.jsx:345-471` | Black strip with duplicated-marquee animation; see "Partner banner" below |
| Install story ("How it installs") | `src/App.jsx:474-614` | 01/02/03 steps + scan-event footnote |
| Comparison ("What changes with transload") | `src/Comparison.jsx` (default) / `src/ComparisonV3.jsx` (`?comparison=v3`) | V2: side-by-side cards with bridge arrow + scroll-reveal. V3: single-stage tab toggle with auto-advance |
| Book a demo | `src/BookDemo.jsx` | Cal.com inline embed (`transload.cal.com/meet`) |
| Tweaks panel (dev only) | `src/Tweaks.jsx` | Opened via `postMessage({type: '__activate_edit_mode'})` from parent; not visible by default |

---

## Key concepts

### Scroll-driven hero transition (`PointCloud.jsx`)
- The hero is a sticky 160vh section. Scroll is normalized to `progress ∈ [0, 1]` in `App.jsx` and passed to `<PointCloud>`.
- Two phases inside the cloud:
  - `progress ∈ [0, 0.7]` — **reveal**: each point migrates from its pinhole-projected image-plane position to its true 3D coordinate, staggered by depth.
  - `progress ∈ [0.7, 1.0]` — **rotate**: camera orbits the cloud centroid.
- The photo (`assets/warehouse.png`) is a DOM `<img>` behind the WebGL canvas, fading out around `progress ≈ 0.1–0.3`. A backdrop plane inside Three.js exists but is disabled (`backdrop.visible = false`).

### Scene data (`assets/scene.js`)
- Sets `window.__SCENE_B64` to a base64 blob encoding the point cloud:
  - `u32 n` — point count
  - 12 bytes padding
  - `Float32Array` of `n × 3` positions
  - `Uint8Array` of `n × 3` RGB bytes
- Decoded in `PointCloud.jsx:decodeScene()`.

### Per-item dimension chips (`App.jsx:304-344`)
- Three chips hard-positioned via `right` / `bottom` in `vw` / `vh` units — they aren't projected from 3D coordinates, so they don't track when the scene rotates. That's why they fade out before rotation (`progress < 0.8`).
- Bounding-box outline color is a local constant `BBOX_COLOR` at the top of the IIFE returning the chip array. Change it in one place to retint all three.
- Orange dot uses `tweaks.accent`.

### Partner banner (`App.jsx:345-471`)
- Section background: `#000` with `rgba(255,255,255,0.14)` hairlines top+bottom and an inset vignette for separation.
- Logos: each entry in the `partners` array carries:
  - `f` — filename under `assets/partners/`
  - `url` — click-through
  - `scale` — per-logo height multiplier on the base 44px
  - `tone: 'light'` (optional) — skip the invert filter for logos whose source is already light (e.g. `tumvl.svg`, which uses `fill="#fff"`)
  - `keepFilter: true` (optional) — don't drop the filter on hover (e.g. `emc.png`, which is dark and would disappear against black on hover)
- Marquee: array is duplicated (`[...Array(2)].flatMap`) and translated by `-50%` over 45s, yielding a seamless loop.
- Edge fades: two absolutely-positioned gradient divs at each end to soften the marquee entry/exit.

### Tweaks panel (`Tweaks.jsx`)
- Not opened by default. A parent window can activate it via `window.postMessage({ type: '__activate_edit_mode' }, '*')`.
- Current tweaks: `accent`, `pointSize`, `bg` (dark/mid/light), `transition` (crossfade/zoom), `autoRotate`, `headlineMode`.
- Default values live in `App.jsx:5-12` inside `/*EDITMODE-BEGIN*/…/*EDITMODE-END*/` markers used by external editors.

---

## Common edits

| I want to… | Edit |
|---|---|
| Change a partner logo's size | `scale` in the partners array in `App.jsx` |
| Flip a logo's polarity (light vs dark source) | Add/remove `tone: 'light'` or `keepFilter: true` in the partners array |
| Move a dimension chip | `pos.right` / `pos.bottom` in `App.jsx:306-308` |
| Change the chip outline color | `BBOX_COLOR` constant just above the chip array |
| Change when chips appear/disappear | The two `progress >= 0.5 && progress < 0.8` checks in `App.jsx:316-317` |
| Retune the scroll transition phases | `revealP` / `rotateP` split in `PointCloud.jsx:316-317` (currently 0.7 / 0.3) |
| Change the hero warehouse photo | Replace `assets/warehouse.png` — it's referenced as `warehouse.png?v=5` for cache-busting; bump the version query too |
| Edit install steps or scan-event footnote | The array inside the install section in `App.jsx` |
| Edit comparison copy (all languages) | `src/i18n.js` — keys under `comparison.past.*` / `comparison.now.*` |
| Switch to the tab-toggle comparison variant | Append `?comparison=v3` to the URL |
| Add a new language | Add a new key block in `src/i18n.js` STRINGS and include its code in `SUPPORTED` |
| Edit book-a-demo destination | Cal.com namespace/origin inside `BookDemo.jsx:37-40` |

---

## Scripts loaded by `index.html`

Pinned CDN versions (no local node_modules):
- React 18.3.1 (UMD dev build)
- ReactDOM 18.3.1
- Babel Standalone 7.29.0 — in-browser JSX transpilation
- Three.js 0.160.0

All `<script type="text/babel">` tags carry `data-presets="react"`.
