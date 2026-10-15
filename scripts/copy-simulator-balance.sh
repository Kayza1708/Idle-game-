#!/bin/bash
set -euo pipefail
# Keep the app's native share sheet open while copying; cache is cleared when it closes.
game_export_app="${1:-com.kayza1708.aisingularity}"
game_export_destination="${2:-$HOME/Downloads}"
game_export_container="$(xcrun simctl get_app_container booted "$game_export_app" data)"
game_export_cache="$game_export_container/Library/Caches/exports"
if [ ! -d "$game_export_cache" ]; then
  printf '%s\n' 'Noch keine ZIP im Simulator-Cache. In der App Balancebericht erstellen, ZIP speichern / teilen wählen und den Teilen-Dialog offen lassen.' >&2
  exit 1
fi
mkdir -p "$game_export_destination"
game_export_count=0
while IFS= read -r -d '' game_export_file; do
  cp "$game_export_file" "$game_export_destination/"
  printf 'Kopiert: %s\n' "$game_export_destination/$(basename "$game_export_file")"
  game_export_count=$((game_export_count + 1))
done < <(find "$game_export_cache" -type f -name 'ai-singularity-balance-*.zip' -print0)
if [ "$game_export_count" -eq 0 ]; then
  printf '%s\n' 'Keine Balance-ZIP gefunden. Export neu öffnen und den Teilen-Dialog offen lassen.' >&2
  exit 1
fi
