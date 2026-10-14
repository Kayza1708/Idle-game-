# Mobiler Folgeauftrag nach PR #110

Basis: main cff21a5 (PR110 gemergt). Wiederhergestellte lokale Änderungen des abgebrochenen Auftrags wurden geprüft und vervollständigt.

## Darstellung und Bedienung

- Randlose mobile Screens und Sheets; kein horizontales Seitenziehen. Bestehende UI-Farben und Pixelart weiterverwendet.
- Drohne patrouilliert in beide Richtungen; Touchziel bewegt sich mit. Öffnungs-/Auslieferungsposition aus dem tatsächlich berührten Element. Gespeicherte Drops bestimmen Auszahlung; Animation erzeugt keine Belohnung.
- Amboss besitzt einen eingezeichneten Sockel, Fusion drei Inputs und einen Ergebnisplatz. Neue lokale Assets: `forge-craft-v2.webp`, `forge-fusion-v2.webp`, `model-core-v2.webp`. Aus der vorherigen Arbeit wiederhergestellt, in dieser Fortsetzung nicht neu generiert.
- Anfangssockel leer. Gelernte Rezepte erst nach Auswahl mit Itemart; lernbare Rezepte separat mit neutralem Icon und Fragmentkosten. Herstellbarkeit aus derselben echten Domainquote wie der Kauf.
- Modellnetz: zweimal Kreis/Prozessor, Dreieck/Kern, Quadrat/Forschung; Farben und Namen ergänzen Formen. Bestehende Ausrüstung, Freischaltungen und Effekte behalten ihren Vertrag.
- Forschung: zwei sichtbare Spalten mit allen Laborplätzen, Bereichsicons und kompakte Kosten, Details im bestehenden Sheet. Nicht nur ein seitliches Karussell.
- Mira-Finger wieder in Dialogen, Sichtbarkeitsprüfung berücksichtigt scrollende Eltern und modale Sheets.
- Level-up verwendet sichtbare Quote und erwartete Itemrevision direkt, ohne Browserconfirm. Recycling bleibt mit eigenem Sheet bestätigt.
- Kisten aus dem Tagesbonus direkt in der Schmiede öffnbar. Sichtbare Deckelöffnung und Materialicons aus dem tatsächlichen Receipt; keine erfundenen Auszahlungen. Ein bereits gespeichertes Receipt zeigt Inhalt, spielt nach Reload keine Öffnung erneut ab. Animation entfällt bei reduced motion und Effekte aus.

## Domain und Save

Save57 konsolidiert leere Nebenstationen und übernimmt die höchste erworbene Stationstufe. Bezahlte Altaufträge und Queues werden nicht gelöscht; sie laufen aus, danach verschwindet die Nebenstation. Neue Arbeit nur Station0. Historische zusätzliche Ausbaustufen als begrenzter dauerhafter Fortschritt erhalten, einschließlich separatem Challenge-Hauptsave. Erhaltener Fortschritt wird nicht nochmals bezahlt oder ausgezahlt. Defekte Saves werden weiterhin abgewiesen.

Serienfertigung kostet zentral 100 INT nach FertigungII, mit Prestigevoraussetzung. Batchguard sowohl UI als auch atomarer Craftpfad. Vor Erwerb genau ein Item möglich. Alte bezahlte Mehrfachjobs behalten Vertrag. Keine Änderungen an Dropchancen, Kistenmengen, Forschungspreisen, Training oder Creditformeln.

## Verifikation

Ergebnis: 1.469 Tests in 107 Dateien bestanden; `npm run typecheck`, `npm run build` und `git diff --check` bestanden. Der Browser-Reloadtest wartet ausdrücklich auf den tatsächlich geschriebenen IndexedDB-Vertrag, bevor er die erhaltenen drei Iteminstanzen nach Reload prüft.

Mobiler Browser: `scripts/mobile-forge-v2-ui-audit.mjs`, zwölf Profile 360/390/430 × 640/844 in DE/EN: echter Touch auf patrouillierende Drohne; leerer Amboss, verborgene unbekannte Art, Batchsperre, bezahltes Level-up ohne Systemdialog, Kistenöffnung mit echtem Receipt und Reload, vier sichtbare Labore, Mira-Finger, keine horizontale Seitenüberbreite/fehlenden Assets/JS-Fehler. `scripts/model-forge-ui-audit.mjs` ergänzt sechs Profile für drei Items sofort craften, 1+1+13-Fusion, zusätzlichen Equipplatz, Recycling/Reload und reduced motion, vier Labortiers und Miras Trainingsweg. Technische Ressourcenfixtures; keine natürliche Progressionsmessung.

Domainregressionen prüfen Batchguard, exakte Kosten, eine Station, Save56→57 mit drei bezahlten Jobs und Altqueue, keinen wiederholten Abschluss nach Reload, geschützten Infrastrukturfortschritt und Ablehnung ungültiger Zähler. Historische Dreifachabschluss-Feedbacktests verwenden tatsächlich vorbereitete Altaufträge statt neue verbotene Stationstarts. Der Prestige-Katalog zählt jetzt 48 Knoten.

Native iPhone/WKWebView/VoiceOver und Langzeitbalance bleiben offen. Bestehende Bundlewarnung bleibt. Kein Merge, Release oder neues SDK.
