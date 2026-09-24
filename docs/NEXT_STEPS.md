# Übergabe und nächste Schritte

## Aktueller Stand
Phase 1 ist funktional implementiert: fünf Hardwareklassen, geometrische Käufe, Meilensteine, Klassen-Upgrades, Tap/Halten, Overclock, frühe Aufträge, kurze/lange Experimente, kumulatives Prestige, Spezialisierungen, Autokauf und Save v5. Der Produktionsstillstand-Test bleibt abgedeckt.

## Bekannte Fehler und Einschränkungen
- Visuelle Browserprüfung bei 390×844 und Desktop war in der Arbeitsumgebung wegen blockierter npm-Registry nicht möglich.
- Das bestehende Lockfile aus dem Ausgangsstand ist unvollständig; `npm ci` kann dies erst nach Registry-Zugriff zuverlässig neu erzeugen.
- Die aktive Balance-Simulation ist ein intensives Profil, keine Aussage über durchschnittliche Spielweise. UI-Halte-/Fokusverhalten benötigt zusätzlich einen echten Browsertest.
- Training ist manuell und abflachend; reale Mobile-/Desktop-Screenshots und Bedienprüfung stehen mangels startbarer npm-Installation aus.

## Nächste drei priorisierte Aufgaben
1. In einer Umgebung mit Registry- und Browserzugriff Lockfile regenerieren, CI vollständig ausführen und mobile Bedienung aufnehmen.
2. Phase-1-Zielzeiten mit echten Spieltests validieren und ausschließlich zentral dokumentierte Werte iterieren.
3. Phase 2 entwerfen: drei besondere Item-Builds mit Tests und klaren Trade-offs.

## Letzter tatsächlich ausgeführter Teststand
Am 24. September 2026 wurde der Quadratwurzel-Regressionstest auf gleich breite Levelintervalle korrigiert, ohne die Formel oder Balance zu verändern. `npm ci`, Typecheck, Vitest, Build und der aktuelle Audit-Endpunkt bleiben durch HTTP 403 der Registry blockiert; keine Prüfung wird als erfolgreich ausgeführt behauptet. Die lokal zwischengespeicherten Advisories betreffen mit Vite und Vitest direkte Entwicklungsabhängigkeiten sowie mit `@vitest/mocker` eine indirekte Vitest-Abhängigkeit; vor einem Update müssen Registry-Audit und Kompatibilität erneut geprüft werden.

## Offene Designentscheidungen
- Wie stark Spieler neue Klassen gegenüber Meilensteinen subjektiv bevorzugen.
- Ob Klassen-Upgrades langfristig mehrere Stufen erhalten sollen.
- Welche drei verhaltensändernden Item-Builds Phase 2 eröffnen.
