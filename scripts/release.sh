#!/bin/bash

OUT_DIR="dist/release"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp -r src/icons "$OUT_DIR/"

bunx lightningcss \
  --bundle \
  --minify \
  --targets 'chrome 112' \
  src/css/main.css \
  -o "$OUT_DIR/style.css"

bunx esbuild src/main.tsx \
  --bundle \
  --outfile="$OUT_DIR/main.js" \
  --format=esm \
  --platform=neutral \
  --target=esnext \
  --external:'gi://*' \
  --external:'file://*' \
  --external:'resource://*' \
  --external:system \
  --external:console \
  --jsx=automatic \
  --jsx-import-source=ags/gtk4 \
  --minify-syntax \
  --minify-whitespace \
  --drop:debugger \
  --legal-comments=none \
  --tree-shaking=true \
  --charset=utf8 \
  --define:process.env.NODE_ENV='"production"' \
  --tsconfig=tsconfig.json
