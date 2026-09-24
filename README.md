# AI Singularity – Audio Pack v1

Original, procedurally composed audio for the cozy retro-pixel idle game. No samples or third-party music are used.

## Files

| File | Use |
|---|---|
| `idle-loop.ogg` / `.mp3` | 48-second seamless background loop; loop continuously while enabled |
| `ui-click.ogg` / `.mp3` | Soft button tap |
| `purchase.ogg` / `.mp3` | Hardware/item purchase |
| `unlock.ogg` / `.mp3` | New feature or milestone unlocked |
| `research-complete.ogg` / `.mp3` | Research project completed |
| `prestige.ogg` / `.mp3` | Longer prestige celebration |
| `gem-pickup.ogg` / `.mp3` | Gem/reward pickup |
| `error.ogg` / `.mp3` | Invalid action or insufficient resources |
| `*.wav` | Uncompressed masters |

## Suggested integration paths

Copy the compressed files to `public/assets/audio/`. Use OGG first and MP3 as fallback. Start the music only after a user gesture, persist music/SFX volume and mute settings, pause when the app/tab is hidden, and respect reduced-motion/accessibility settings. Debounce repeated click sounds so tapping quickly does not become harsh. Do not play the prestige sound for ordinary purchases.

The background track is exactly 16 bars at 80 BPM (48 seconds) and is composed to loop. Confirm the loop boundary in the target browser/device before release.
