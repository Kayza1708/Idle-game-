# Mobile Rückkehr, Labor und gefüllter Kapselautomat

## Integration gegen main

Die Screenshots zeigten tatsächlich einen Stand ohne die Modell-/Schmiedefunktionen. PR 108 war bereits nach main gemergt, als PR 109 anschließend in seinen Vorgängerbranch `codex/progression-motion` gemergt wurde. Damit enthielt main `fb6f36b` nur die vorherigen Labor-/Drohnenänderungen. Das war ein Integrationsfehler, kein fehlender iPhone-Pull.

Dieser Branch basiert direkt auf main und enthält die vollständigen Änderungen aus `17ce65c` (lokal als `a19788a` übernommen) plus die folgenden UI-Korrekturen. Der neue PR muss **main** als Ziel haben. Frühere Branches werden nicht überschrieben. Kein automatischer Merge, keine native Veröffentlichung. Modellnetz, Credittraining, Archiv, Sofortcrafting, Fusion, Recycling, Level und Save-v56-Verträge sind in [model-forge-v1.md](model-forge-v1.md) beschrieben. Diese übernommenen Funktionen enthalten die bereits beauftragten Gameplayänderungen; die zusätzliche UI-Korrektur verändert keine Wirtschaft oder Zufallschancen.

## Darstellung und Bedienung

- Rückkehrdialog: kompakte Zeitzeile, zweispaltige tatsächlich produzierte Credits/Daten, bis zu acht Materialtypen und tatsächlich abgeschlossene Jobs/Hardwarekäufe. Ertrag bleibt ausdrücklich brutto vor Automationsausgaben; keine irreführende Darstellung als neu auszahlbarer Betrag.
- Details zeigen alle übrigen Materialien, tatsächliche Abwesenheit/angerechnete/verlorene Zeit, aktuellen verfügbaren Bestand, einzelne Itemquittungen, abholbare Belohnungszahlen und vorhandene Navigation/Queuehinweise. Kein Ergebnis wird weggelassen. Nur der Body scrollt; Weiter-/Belohnungs-/Items-Aktionen bleiben außerhalb. Fokusfang, Escape, Wiederherstellung des Auslösers und Scrollsperre. Der Fokus wird nicht bei jedem Heartbeat zurückgesetzt. Der bestehende native Back-Vertrag bleibt erhalten.
- Haupttab heißt Labor/Lab (alle sieben vorhandenen Tabübersetzungen angepasst), Schmiede bleibt eindeutig getrennt. Technischer Tabkey `workshop` bleibt kompatibel.
- Sichtbarer Tap-/Hold-Hinweis aus dem Labor entfernt. Mira erklärt beide Eingaben im Tap-Tutorial und in der dazugehörigen Dialogzeile. Zugänglicher Buttonname und gesperrte manuelle Eingabe in Challenges bleiben bestehen. Tap-/Hold-Dauer und Belohnungen bleiben unverändert.
- Kapseln sind nun direkt im Bitmap enthalten: detailreiche unterschiedliche Farben, sichtbare Nähte, unregelmäßiger dichter Stapel mit Überlappungen und Glasreflexen. Keine unabhängigen SVG-Kugeln oder Bowl-Rattle-Animation. Kurbel, Tür, ausgegebene Kapsel, Funken und bestehende Item-/Jackpotfeier bleiben erhalten. Draw, Preis, RNG, Quittung und Video-Erfolgsprüfung sind unverändert. Kleine Viewports erhalten eine kürzere Bühne.
- Queuehinweise nennen jetzt Credits entsprechend dem übernommenen Trainingsvertrag; kein neuer automatischer Jobstart.

## Asset und reproduzierbarer Bildauftrag

Projektasset: `public/assets/game/capsule-machine-filled-v3.webp`, 1024×1536, RGBA mit transparentem Außenraum. Quelle: eigener vorhandener `capsule-machine-v2.webp`. Originalresultat: `generated_images/exec-fb68b176-ba35-44f9-9db3-759ade1707f4.png`; als WebP Qualität 94 integriert. Kurbelzentrum und Ausgabeschacht behalten die bestehenden Overlaykoordinaten (512/1000 bzw. 512/1240). Kein externes Markenmaterial.

Vollständiger ImageGen-Prompt:

> Use case: precise-object-edit. Edit target: supplied transparent 1024x1536 pixel-art gumball machine. Preserve the machine silhouette, exact front-facing geometry, red copper gold cabinet, glass outline, crank socket at center x512 y1000, dispenser x512 y1240 and transparent background. Change ONLY the glass bowl contents. Paint many highly detailed glossy pixel-art capsules INSIDE the glass, touching and overlapping naturally in a dense irregular pile supported on the bowl floor, filling about three quarters of the glass. No evenly spaced circles, no isolated floating balls, no grid. Teal, amber, ruby, violet and blue capsules, visible equator seams, small pixel glints, shaded undersides, cast shadows between capsules, some partly hidden behind other capsules, curved glass reflections on top of the pile. Match the handcrafted detailed pixel texture of the existing cabinet. Keep the circular crank hub empty so the game overlays its animated handle; keep dispenser empty. No handle, no UI, no text, no extra objects. Preserve original proportions and original placement as closely as possible. A single integrated filled machine bitmap, not separate ball sprites. True transparent background.

## Prüfverfahren und Grenzen

`scripts/mobile-return-capsule-ui-audit.mjs` lädt vorbereitete gültige Saves, lässt eine echte Offline-Stunde abrechnen und prüft 360/390/430 px, 640/844 px Höhe, DE/EN. Zusammenfassung ohne nötiges Scrollen, erreichbare Details, Footergröße, Labor-/Schmiedelabel, sechs Modellslots, echte Schmiede, Bitmapautomat, echte Gem-Züge, reduzierte Bewegung, keine Seitenüberbreite oder fehlenden Assets/JS-Fehler. Screenshots und Ergebnisse liegen reproduzierbar in `node_modules/.cache/mobile-return-capsule-ui`.

`scripts/model-forge-ui-audit.mjs` prüft zusätzlich vorbereitete sechs DE/EN-Profile mit echtem Crafting, Fusion 1+1+13, Zusatzslot-Ausrüstung, Recycling, Reload, reduzierter Bewegung sowie Laborlevel 0/10/25/50 und dem Mira-Trainingsweg. Das ist eine Interaktionsprüfung, keine natürliche Progressions-/Balancekalibrierung.

Vollständige Standardsuite: 1.463 Tests in 106 Dateien bestanden; Source-Path-Check/Typecheck, Build und Diffcheck grün. Native iPhone-/WKWebView-Safe-Area, VoiceOver, großer Systemtext und Store-Release bleiben Geräteabnahmen; Chromium-Mobile ist kein Ersatz dafür.

Zwei bestehende reine Funktionstests verarbeiteten hier echte begrenzte Offlinefenster länger als ihre Runnerbudgets: Acht-Stunden-Resetdeckel rund 7 s bei vorher 5 s; 90-Minuten-INT-Trace einmal rund 19 s bei vorher 10 s. Nur deren begrenzte Testbudgets sind jetzt 15/30 s. Zeitdeckel, Ledger- und Resetassertions bleiben vollständig erhalten; keine globale Timeoutänderung und keine Behauptung verbesserter Laufzeit. Die anschließende vollständige Suite bestand alle 1.463 Tests.
