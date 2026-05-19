# LinkedIn banner generator

Renders the transload LinkedIn personal-profile banner at the exact 1584×396 spec, using a frame from the hero render as the backdrop.

## Usage

```sh
chmod +x render.sh   # first time only
./render.sh          # default frame 865 (~36s, dense wireframes + camera light cones)
./render.sh 1080     # use a different frame
```

Outputs:
- `~/Downloads/transload-linkedin-banner.png` — 1584×396 raw render
- `~/Downloads/transload-linkedin-banner.jpg` — sRGB-stripped, ~150 KB, **upload this one** (LinkedIn's web uploader rejects some PNGs)

## Prerequisites

- `TransloadRenderingFinalFixed.mov` (the 4K hero render) sitting at the repo root — gitignored, not checked in
- `ffmpeg`, ImageMagick (`magick`), and Google Chrome at `/Applications/Google Chrome.app`

## Picking a frame

The video is 24 fps × 45.5 s = ~1092 frames. Some good ones:
- **865** (~36s) — full wireframe density + blue camera light cones (default)
- **1008** (~42s) — same density, no light cones, more "settled"
- **1091** (last) — pallets fully reconstructed, some filled

## Customising

- Headline copy + colours: edit `banner.html`
- Backdrop crop: edit the `object-position` on `.bg-frame` in `banner.html`
- Output paths or default frame: edit `render.sh`
