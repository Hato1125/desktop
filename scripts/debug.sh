#!/bin/bash

mkdir -p dist/debug
cp -r src/icons dist/debug/
bunx lightningcss --bundle --targets 'chrome 112' src/css/main.css -o dist/debug/style.css
bunx esbuild src/main.tsx \
  --bundle \
  --outfile=dist/debug/main.js \
  --format=esm \
  --platform=neutral \
  --external:'gi://*' \
  --external:'file://*' \
  --external:'resource://*' \
  --external:system \
  --external:console \
  --main-fields=module,main \
  --jsx=automatic \
  --jsx-import-source=ags/gtk4 \
  --sourcemap=inline \
  --tsconfig=tsconfig.json
