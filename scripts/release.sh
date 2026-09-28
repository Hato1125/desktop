#!/bin/bash

OUT_DIR="dist/release"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp -r src/icons "$OUT_DIR/"

bunx lightningcss \
  --bundle \
  --targets 'chrome 112' \
  src/css/main.css \
  -o "$OUT_DIR/style.css"

mkdir -p "$OUT_DIR/theme"
bunx lightningcss --targets 'chrome 112' src/css/theme/light.css -o "$OUT_DIR/theme/light.css"
bunx lightningcss --targets 'chrome 112' src/css/theme/dark.css -o "$OUT_DIR/theme/dark.css"

bunx esbuild src/main.tsx \
  --bundle \
  --outfile="$OUT_DIR/main.js" \
  --format=esm \
  --platform=neutral \
  --target=es2022 \
  --external:'gi://*' \
  --external:'file://*' \
  --external:'resource://*' \
  --external:system \
  --external:console \
  --main-fields=module,main \
  --jsx=automatic \
  --jsx-import-source=ags/gtk4 \
  --minify \
  --keep-names \
  --drop:debugger \
  --legal-comments=none \
  --tree-shaking=true \
  --charset=utf8 \
  --define:process.env.NODE_ENV='"production"' \
  --define:SRC="\"$(realpath "$OUT_DIR")\"" \
  --tsconfig=tsconfig.json
