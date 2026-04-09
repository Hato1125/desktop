#!/bin/bash

mkdir -p dist/release
cp -r src/icons dist/release/
bunx lightningcss --bundle --minify --targets 'chrome 112' src/css/main.css -o dist/release/style.css
bunx esbuild src/main.tsx \
  --bundle \
  --outfile=dist/release/main.js \
  --format=esm \
  --platform=neutral \
  --external:'gi://*' \
  --external:'file://*' \
  --external:'resource://*' \
  --external:system \
  --external:console \
  --jsx=automatic \
  --jsx-import-source=ags/gtk4 \
  --minify-syntax \
  --minify-whitespace \
  --tsconfig=tsconfig.json
