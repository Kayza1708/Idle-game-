# Unity: aktive Signal-Drops

Teilabschnitt 5a, nach den geprüften Missionen und Seasons. Kein Gesamtabschluss von Shop oder Rewrite.

## Tatsächliche Regeln

Die drei vorhandenen Varianten Signal/Münze, Cache und Kern verwenden die Originalintervalle, Sichtbarkeit, Mengen, Qualitätsgewichte, Credits-/Datensekunden, Itemchance und Bauplanchance. Signalprotokolle und ausgerüstete Drop-Effekte beeinflussen tatsächlich Häufigkeit und Qualität. Der Ausgleichsfaktor wird beim Spawn eingefroren und beim Einsammeln nicht nach dem aktuellen Forschungsstand neu berechnet. Materialzugang und Qualitätsziehung verwenden dagegen wie die Vorlage den Einsammelzustand.

Aktive verstrichene Zeit erzeugt Signale; Offlinezeit erzeugt keine. Die Fortschrittsreste und gemeinsame `nextId` bleiben gespeichert. Varianten und Laborpositionen stammen aus derselben ID-Arithmetik, auch bei großen IDs mit JavaScript-Double-Rundung. Das Sichtbarkeitslimit bleibt unverändert. Abgelaufene Belege zahlen nichts aus. Am exakten Ablaufzeitpunkt unterscheiden sich bewusst direktes Claim und die vorherige aktive Bereinigung gemäß Vorlage.

Credits aus Signalen zählen zum INT-fähigen Einkommen und dessen Anspruch, aber nicht zu `regularCredits`. Direkte Datengewinne zählen ebenfalls nicht als reguläre Datenproduktion. Materialien und eingesammelte Signale aktualisieren ihre echten Lifetime-/Missions-/Achievementproduzenten. Seltene Kernitems verwenden den ursprünglichen, vom Kapsel-/Truhenpool verschiedenen Pool; keine erfundene Freischaltung des Erkenntnisarchivs. Entdeckte Baupläne werden nicht automatisch gelernt. Alle Zufallsziehungen werden dem reinen C#-Kern explizit übergeben; die Oberfläche zahlt nichts aus.

No-Taps-Challenges sperren das Einsammeln. Closed-Supply-Chain sperrt den Itemteil, nicht die übrigen ursprünglichen Signalbelohnungen. Der pausierte Hauptzustand erhält seine eigenen Belege zurück; Sichtbarkeitsfristen werden wie die Quelle nicht durch die Challenge verlängert. Normales Prestige bewahrt vorhandene eingefrorene Signale entsprechend dem Quellcode.

Die alten Quellprüfungen für `analysis4`/`analysis7` werden nicht künstlich auf moderne INT-Knoten umgebogen. Der aktuelle `legacyMap` enthält dafür keine Ersatzabbildung. Historische Legacy-Knoten und deren vollständige Webübernahme bleiben Teil des expliziten Importvertrags in Abschnitt 8.

## Bedienung

Szene `Assets/Scenes/IdleIntelligence.unity` öffnen, Play drücken und im Labor aktiv spielen. Ohne Drop-Boni entsteht nach 90 aktiven Sekunden ein Signal; es bleibt zwölf Sekunden sichtbar. Das Signal erscheint direkt über der vorhandenen Laborgrafik mit existierender Komponentengrafik und einer Restzeit. Anklicken sammelt es über die echten Spielsysteme ein. Item-/Prestigeansichten verdecken das Labor wie bisher; die echte Sichtbarkeitsfrist läuft weiter. Ein Doppelklick erzeugt keinen zweiten Ertrag oder Zufallszugriff.

Der neue Produzent macht die bereits portierten Signal-Drop-Missionen tatsächlich erfüllbar. Drops, Angebote, Shop, Gumball und Boosts werden deshalb nicht pauschal als gesamter Abschnitt 5 abgehakt.

## Speicher und Prüfung

Unity-Save v11 ergänzt aktive Belege und Fortschrittsreste. Native V1–10 erhalten unveränderte Originalkopien. Ältere Unity-Stände erhalten keine rückwirkenden Signalbestände oder historischen Claims; Missionen, Seasons, Items, Entitlements und pausierte Hauptzustände bleiben erhalten. Beschädigte aktuelle Signalverträge sperren das Original. Webimport bleibt explizit und wird nicht automatisch ausgeführt.

213 gemeinsame Fälle führen echte TypeScript-Funktionen mit injiziertem RNG aus und vergleichen Spawnzeit, Varianten/Positionen, eingefrorene Faktoren, Material-/Item-/Bauplanergebnis, genaue Zufallsaufrufe, Lifetime, reguläre Produktion und INT-fähiges Einkommen. Grenzen, No-Taps, Challenge-Rückkehr, Prestige und wiederholte Claims sind enthalten. Die acht zusätzlichen Faktor-Save-Grenzfälle vergleichen auch die aktuelle TypeScript-Validierung (einschließlich der Grenzen 1 und 4). [Tatsächliche Prüfdaten](unity-signals-verification.json): vollständige 58/58 EditMode- und 33/33 PlayMode-Tests; nach ergänztem Closed-Supply- und Faktorvertrag 3/3 Signal-/Save-Nachtests. 1.872 Vitest-Tests in 136 Dateien, danach zwei betroffene Verträge nochmals erfolgreich. Build/Typecheck und Export sind erfolgreich; bekannte Bundlegrößenwarnung bleibt. Mobile Laborbilder auf 320/390/430 px sind visuell geprüft; keine echte Geräte- oder Releaseabnahme. Vorbereitete Labor-Fortschrittsstände sind technische UI-Prüfungen, keine natürliche Erwerbsmessung.
