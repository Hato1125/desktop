#!/bin/bash

INSTANCE="desktop"

ags quit -i "$INSTANCE" 2>/dev/null
scripts/debug.sh
ags run dist/debug/main.js -g 4 &

bunx nodemon \
  --watch src \
  --ext 'ts,tsx,css' \
  --exec "scripts/debug.sh && (ags quit -i $INSTANCE 2>/dev/null; ags run dist/debug/main.js -g 4 &)"
