#!/usr/bin/env bash
# Build and launch an isolated macOS balance-playtest player.
# Invocation: bash scripts/playtest-macos.sh [--build-only]
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This player builder requires macOS and Unity 6000.3.26f1." >&2
  exit 2
fi
if [[ "${1:-}" != "" && "${1:-}" != "--build-only" ]]; then
  echo "Usage: bash scripts/playtest-macos.sh [--build-only]" >&2
  exit 2
fi

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
project="$repo/IdleIntelligence"
unity="${UNITY_BIN:-/Applications/Unity/Hub/Editor/6000.3.26f1/Unity.app/Contents/MacOS/Unity}"
if [[ ! -x "$unity" ]]; then
  echo "Unity Editor missing at: $unity" >&2
  echo "Set UNITY_BIN to the actual Unity 6000.3.26f1 editor executable." >&2
  exit 2
fi

# Avoid opening a second Unity editor and touching the existing project lock.
if pgrep -f '[U]nity.app/Contents/MacOS/Unity' >/dev/null 2>&1; then
  echo "A Unity Editor process is already running. Close it normally before building." >&2
  echo "Do not delete Library/ or Unity lockfiles." >&2
  exit 2
fi

commit="$(git -C "$repo" rev-parse --verify HEAD)"
branch="$(git -C "$repo" branch --show-current)"
if [[ -n "$(git -C "$repo" status --porcelain)" ]]; then
  echo "WARNING: Uncommitted files exist. The player uses the actual working tree."
  echo "Do not interpret the commit hash as proof that local files are unchanged."
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
output="$project/Builds/BalancePlaytest-${commit:0:8}-$timestamp.app"
log="$project/Builds/BalancePlaytest-${commit:0:8}-$timestamp.unity.log"
mkdir -p "$project/Builds"
echo "Building branch=${branch:-detached}, commit=$commit"
echo "Output: $output"

IDLE_PLAYER_OUTPUT="$output" IDLE_BUILD_COMMIT="$commit" \
  "$unity" -batchmode -quit -projectPath "$project" \
  -executeMethod IdleIntelligence.Editor.BuildLocalPlayer.BuildBalancePlaytest \
  -logFile "$log"

if [[ ! -d "$output" || ! -f "$output.report.txt" ]] || \
   ! grep -qx 'Succeeded' <(head -n 1 "$output.report.txt"); then
  echo "Build was not verified. Read the Unity log: $log" >&2
  exit 1
fi

echo "Verified macOS player: $output"
echo "Build report: $output.report.txt"
echo "Unity log: $log"
echo "Playtest save is isolated by company/product/bundle identity."
echo "It uses the currently active normal game rules; partial V3 persistence is NOT enabled."
if [[ "${1:-}" != "--build-only" ]]; then
  open "$output"
fi
