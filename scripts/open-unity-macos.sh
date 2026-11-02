#!/usr/bin/env bash
# Open the single Idle Intelligence Unity project. No npm or TypeScript.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
editor="${UNITY_BIN:-/Applications/Unity/Hub/Editor/6000.3.26f1/Unity.app/Contents/MacOS/Unity}"
if [[ "$(uname -s)" != "Darwin" || ! -x "$editor" ]]; then
  echo "Install Unity Editor 6000.3.26f1 in Unity Hub (or set UNITY_BIN)." >&2
  exit 2
fi
exec "$editor" -projectPath "$root"
