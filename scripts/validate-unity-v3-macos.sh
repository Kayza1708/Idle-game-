#!/usr/bin/env bash
# Real Unity Editor validation, distinct from dotnet-only native-core checks.
# Run while the Unity Editor is closed. Never mutates a player's existing saves.
set -euo pipefail
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Requires macOS and Unity 6000.3.26f1." >&2
  exit 2
fi
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
project="$root/IdleIntelligence"
unity="${UNITY_BIN:-/Applications/Unity/Hub/Editor/6000.3.26f1/Unity.app/Contents/MacOS/Unity}"
if [[ ! -x "$unity" ]]; then
  echo "Unity binary missing: $unity" >&2
  exit 2
fi
if pgrep -f '[U]nity.app/Contents/MacOS/Unity' >/dev/null; then
  echo "Close the interactive Unity Editor before invoking batch validation." >&2
  exit 2
fi
stamp="$(date +%Y%m%d-%H%M%S)"
logs="$root/unity-v3-acceptance/$stamp"
mkdir -p "$logs"
echo "Unity V3 test evidence: $logs"
echo "Git HEAD: $(git -C "$root" rev-parse HEAD)" > "$logs/provenance.txt"
echo "Project: $project" >> "$logs/provenance.txt"
echo "Unity: $unity" >> "$logs/provenance.txt"

run_editor() {
  local label="$1"; shift
  local log="$logs/$label.log"
  local args=(-batchmode -projectPath "$project" -logFile "$log")
  # Unity Test Framework owns the Editor lifecycle when -runTests is used.
  # Passing -quit exits before the NUnit XML result can be written.
  if [[ "$label" != "editmode" && "$label" != "playmode" ]]; then
    args+=(-quit)
  fi
  echo "=== $label ==="
  local status=0
  "$unity" "${args[@]}" "$@" || status=$?
  if grep -E 'error CS[0-9]+:|Scripts have compiler errors|Compilation failed' "$log"; then
    echo "$label contains compiler errors; see $log" >&2
    return 1
  fi
  if [[ "$label" == "editmode" || "$label" == "playmode" ]]; then
    # Unity normally exits nonzero when a test fails. Read the report first:
    # printing the end of the Editor log hides the actual NUnit assertions.
    verify_xml "$logs/$label.xml" || return 1
  fi
  if (( status != 0 )); then
    echo "$label failed with Unity exit code $status; see $log" >&2
    tail -n 75 "$log" >&2 || true
    return "$status"
  fi
}

verify_xml() {
  local result="$1"
  if [[ ! -s "$result" ]]; then
    local name="${result##*/}"
    local suite="${name%.xml}"
    echo "Unity returned without a $suite XML test report: $result" >&2
    echo "Last 100 lines of $suite Editor log:" >&2
    tail -n 100 "$logs/$suite.log" >&2 || true
    echo "Check for test discovery, package resolution, licensing or process errors." >&2
    return 1
  fi
  python3 - "$result" <<'PY'
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
p = Path(sys.argv[1])
if not p.exists():
    raise SystemExit(f"Unity did not create test results: {p}")
r = ET.parse(p).getroot()
failed = int(r.get("failed", "0"))
total = int(r.get("total", "0"))
result = r.get("result")
print(f"Unity {p.stem}: result={result}, total={total}, failed={failed}")
if failed or total == 0 or result != "Passed":
    cases = [c for c in r.iter("test-case") if c.get("result") in ("Failed", "Error")]
    if not cases:
        cases = [c for c in r.iter("test-suite") if c.get("result") in ("Failed", "Error") and c.find("failure") is not None]
    for index, case in enumerate(cases[:40], 1):
        name = case.get("fullname") or case.get("name") or "<unnamed>"
        print(f"\nFAIL #{index}: {name}")
        failure = case.find("failure")
        if failure is not None:
            for field in ("message", "stack-trace"):
                value = failure.findtext(field)
                if value:
                    print(f"{field}:\n{value[:3500]}")
        reason = case.findtext("reason/message")
        if reason:
            print(f"reason: {reason[:1500]}")
    if len(cases) > 40:
        print(f"and {len(cases)-40} additional failures; see {p}")
    raise SystemExit(f"Unity {p.stem} failed; inspect the reports above and {p}")
print(f"Unity test suite passed: {p}, total={total}")
PY
}
run_editor compile
run_editor editmode -runTests -testPlatform EditMode -testResults "$logs/editmode.xml"
run_editor playmode -runTests -testPlatform PlayMode -testResults "$logs/playmode.xml"

output="$logs/IdleIntelligence-V3-Smoke.app"
echo "=== macOS development player ==="
if ! IDLE_PLAYER_OUTPUT="$output" "$unity" -batchmode -quit -projectPath "$project" \
    -executeMethod IdleIntelligence.Editor.UnityV3BuildVerification.BuildMac \
    -logFile "$logs/player-build.log"; then
  echo "Unity macOS player build failed. Log: $logs/player-build.log" >&2
  tail -n 75 "$logs/player-build.log" >&2 || true
  exit 1
fi
if [[ ! -d "$output" || ! -f "$output.report.txt" ]] || \
   [[ "$(head -n 1 "$output.report.txt")" != "Succeeded" ]]; then
  echo "Unity macOS player build did not provide an accepted report." >&2
  exit 1
fi
echo "FULL UNITY EDITOR COMPILE, EDITMODE, PLAYMODE AND macOS PLAYER BUILD PASSED"
echo "Evidence: $logs"
