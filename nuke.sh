#!/bin/bash
TARGETS=("node_modules" "package-lock.json" ".next" ".turbo" "dist" ".cache")
spin() { local -a spin_chars=(⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏); while kill -0 "$1" 2>/dev/null; do for c in "${spin_chars[@]}"; do printf "🧹 Deleting... %s" "$c"; sleep 0.1; done; done; }
( for item in "${TARGETS[@]}"; do [ -e "$item" ] && rm -rf "$item"; done ) & DELPID=$!; spin $DELPID; wait $DELPID
echo -e "✅ Cleanup complete: ${TARGETS[*]}"
