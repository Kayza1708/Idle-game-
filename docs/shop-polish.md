# Shop und Schmiede: visuelle Integration

Der Shop hat sieben direkt erreichbare obere Reiter: Heute, Kisten, Automat, Material, Boosts, Upgrades und Gems. Der bisherige Extras-Aufklapper entfällt. Die Reiter scrollen horizontal, sind mit Pfeiltasten/Home/End bedienbar und öffnen jede Kategorie wieder am Anfang.

Die vorhandene Gumball-Maschine nutzt ihre bisherigen Quoten, Gem-/Video-Abwicklung, mechanischen Sprite-Animationen und gespeicherten Auszahlungen. Boosts und dauerhafte Upgrades verwenden einheitliche Shopkarten, Bestätigungen und Kauf-Feedback ausschließlich nach einem tatsächlichen Gem-Ledger-Eintrag. Inaktive Zeitverkürzungen zeigen keinen falschen Nullpreis. Native Echtgeldangebote bleiben deaktiviert.

Gem-Grafik: 100 Gems = ein Kristall, 550 Gems = zwei, 1200 Gems = drei. Bundles skalieren entsprechend ihrem Gem-Inhalt. Gemeinsame Pixel-Art für Menü, Einstellungsheader und Upgrade-/Boost-Angebote.

Stations-Level: separate Aufbau-/Ausbaukäufe sind aus App und Oberfläche entfernt. Der bisherige Zugang (erster Prestige + Fertigung I) erlaubt Item-Veredelung direkt, mit unveränderten Itemkosten und maximal Forge 20. Alte bezahlte Tempo-Boni und eingefrorene Aufträge bleiben erhalten. Save v59 ersetzt nur unerfüllte Stations-Ausbaumissionen durch die verbleibende Zahl an Item-Veredelungen; bereits abholbare/beanspruchte Belohnungen und Ressourcen bleiben unverändert. Veraltete Level-Felder/APIs bleiben allein zur Save-/Alt-Test-Kompatibilität erhalten.

## Nachweis

Vier tatsächliche Browserprofile: 360×640 DE, 390×844 DE, 430×844 EN und 390×844 DE mit reduzierter Animation. Geprüft: sieben Kategorien, echter Offline-Kauf und Wiederkauf-Sperre, echter Laborboost mit exaktem Preis, Gumball-Debit/Auszahlung und Reload ohne erneute Vergabe, deaktivierte native Produkte, 1/2/3 Gem-Sprites, Pixel-Icons, entfallene Stations-Level-Oberfläche, fehlende Assets/JS-Fehler/Overflow. Zusätzliche Domain- und Render-Tests decken freien Stationsstart, Zugang/Cap/Altboni, Missionsmigration und Icon-/Karten-Darstellung ab.

ZIP aus dem Simulator: siehe [native-integrations.md](native-integrations.md) und `bash scripts/copy-simulator-balance.sh`. Der native Teilen-Dialog muss beim Kopieren offen bleiben. Mac/Xcode-Geräteverifikation bleibt offen.

## Grafiken

Eingesetzter Atlas: `public/assets/game/shop-menu-icons-v1.webp`, 1448×1086, transparent, 4×3 Zellen. Mit der eingebauten Imagegen-Funktion erzeugt; verlustfrei in WebP kodiert. Gemeinsame Abbildung in `src/ShopIcon.tsx`. Keine neuen oder fremden Sprite-Pakete.

Vollständiger Prompt:

Use case: stylized-concept. Asset type: production pixel-art sprite atlas for a dark sci-fi mobile idle game. Create exactly 12 standalone detailed inventory/menu icons in an exact regular 4-column by 3-row grid. Transparent background. Every cell same size, each object centered with generous transparent padding and no overlap. Read row-major: row 1: (1) metallic cyan operator/profile ID badge with a simple anonymous head silhouette, (2) gold star season-pass medal with violet crystal, (3) teal missions clipboard with three glowing checkmarks, (4) purple sci-fi challenge flag on short metal pedestal. Row 2: (5) golden achievement trophy with cyan details, (6) substantial silver steel settings cog with cyan inner energy core, (7) extra laboratory chamber with teal glass tank, (8) offline storage clock with orange clock hands and small data cartridge. Row 3: (9) glowing cyan laboratory research booster vial, (10) forging speed booster: chunky steel hammer with amber energy trail, (11) training accelerator: violet AI chip with cyan energy lightning, (12) one large faceted purple gem crystal. Style: real crisp hand-crafted retro pixel art, chunky stepped pixels, metal outlines, 3-5 shade clusters per material, tiny controlled highlights, slight isometric volume, readable at 40-72px display. Palette dark navy steel, vibrant cyan/teal, warm gold, violet, white highlights. These are GAME ICONS with substantial silhouettes, not thin line symbols. No text, numbers, captions, labels, frames, card backgrounds, gradients behind objects, UI mockup or watermark. Entire canvas 4:3 ratio, cells form a regular atlas usable with background-size 400% 300%.

## Ansichten

[Automat](screenshots/shop-polish-capsule.webp) · [Boosts](screenshots/shop-polish-boosts.webp) · [Upgrades](screenshots/shop-polish-upgrades.webp) · [Gem-Pakete](screenshots/shop-polish-gems.webp) · [Menü](screenshots/shop-polish-menu.webp) · [Einstellungen](screenshots/shop-polish-settings.webp)

Abschluss: alle 1.536 Tests in 113 Dateien, Typecheck, Produktionsbuild, vier Browserprofile und git diff --check erfolgreich. Bestehende Bundlegrößen-Warnung unverändert; kein Merge, Release oder neuer Werbe-/Zahlungs-SDK.
