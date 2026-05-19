#!/usr/bin/env bash
set -euo pipefail

# Render the transload LinkedIn personal-profile banner.
#
# - Extracts a frame from TransloadRenderingFinalFixed.mov at the repo root
#   (the 4K hero render — not checked in, gitignored *.mov)
# - Renders banner.html with Chrome headless at the LinkedIn spec
#   (1584x396)
# - Strips metadata and exports an sRGB JPG that LinkedIn's uploader
#   accepts reliably
#
# Usage:
#   ./render.sh              # default frame 865 (~36s, dense wireframes)
#   ./render.sh 1080         # use a different frame
#
# Outputs:
#   ~/Downloads/transload-linkedin-banner.png
#   ~/Downloads/transload-linkedin-banner.jpg   <- upload this one

FRAME=${1:-865}

REPO_ROOT=$(git rev-parse --show-toplevel)
SOURCE_MOV="$REPO_ROOT/TransloadRenderingFinalFixed.mov"
TOOL_DIR="$REPO_ROOT/tools/linkedin-banner"
BG_PNG="$TOOL_DIR/banner-bg.png"
OUT_PNG="$HOME/Downloads/transload-linkedin-banner.png"
OUT_JPG="$HOME/Downloads/transload-linkedin-banner.jpg"

if [ ! -f "$SOURCE_MOV" ]; then
  echo "Source render not found: $SOURCE_MOV"
  echo "Drop TransloadRenderingFinalFixed.mov at the repo root and re-run."
  exit 1
fi

echo "▸ Extracting frame $FRAME from the 4K render..."
ffmpeg -y -i "$SOURCE_MOV" -vf "select=eq(n\,$FRAME)" -frames:v 1 -q:v 2 "$BG_PNG" 2>/dev/null

echo "▸ Rendering banner at 1584x396..."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --hide-scrollbars --disable-gpu \
  --window-size=1584,396 \
  --virtual-time-budget=5000 \
  --screenshot="$OUT_PNG" \
  "file://$TOOL_DIR/banner.html" 2>&1 | tail -1

echo "▸ Converting to sRGB JPG (LinkedIn-friendly)..."
magick "$OUT_PNG" -colorspace sRGB -strip -quality 92 -interlace JPEG "$OUT_JPG"

echo ""
echo "✓ Done"
ls -lh "$OUT_PNG" "$OUT_JPG"
open "$OUT_JPG"
