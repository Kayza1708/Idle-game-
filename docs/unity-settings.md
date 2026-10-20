# Unity · Einstellungen, Sprache und Audio · Abschnitt 7 in Arbeit

Stand 20.10.2026. Abschnitt 6b ist als `e7eb8e97` gepusht; Folge-Draft #136 ist offen. Dieser Bericht markiert **Abschnitt 7 nicht als abgeschlossen**. Abschnitt 8 und die breite Schlussabnahme bleiben offen.

## Tatsächlich angeschlossen

`Forschung → Einstellungen` bietet sieben gespeicherte Sprachen, drei Zahlenformate, Hardware-Kaufmenge ×1/×10/Max, Effekte/reduzierte Bewegung, Musik, Stummschaltung und Haptikpräferenz. Lautstärken sind in Prozent-Schritten erreichbar. Hardwarekäufe verbrauchen die tatsächliche Menge und den geometrischen Originalpreis; Max verwendet große Zahlen. Effekteinstellung und bisheriger Bewegungsmodus sind synchronisiert.

380 Textkopien werden reproduzierbar aus `i18n.ts`, `gameplayI18n.ts`, `workshopI18n.ts` und den Originalnamensfunktionen exportiert. Ressourcen, Hardware und Forschungsnamen sowie die Einstellungen verwenden sie bereits. **Weitere Unity-Ansichten enthalten noch deutsche Texte**. Die sieben Auswahlknöpfe sind deshalb keine Abnahme der gesamten Übersetzung. Die Vorlage enthält selbst englische und deutsche Fallbacks; diese werden erhalten, nicht als neue Übersetzungen ausgegeben.

Die tatsächliche Original-Zahlenformatierung verwendet für kompakte Zahlen `de-DE`, auch bei anderer Spielsprache. C# erhält dies einschließlich Mio./Mrd./Bio., geschütztem Leerzeichen, wissenschaftlicher/technischer Exponenten und JavaScript-`toFixed`-Rundung. Keine Balanceänderung.

Alle acht vorhandenen OGG-Dateien werden als Unity-Audioclips importiert. Musik reagiert auf gespeicherte Einstellungen, erste Nutzeraktion sowie Fokus/Pause. Effekte verwenden vier Stimmen und den ursprünglichen 100-ms-Abstand für Klick/Kauf. Reine Sound-/Haptikrouten sind vorbereitet und in den wesentlichen UI-Aktionen angebunden; vollständige Ereignis-/Aktionsabdeckung bleibt mit der Story- und Diagnoseanbindung zu prüfen. Kein neues Audioasset oder SDK.

Auf dieser Plattform gibt es keine bestehende Unity-Anbindung für die drei originalen Vibrationsmuster. Die Einstellung bleibt gespeichert; die Oberfläche nennt die fehlende technische Anbindung. `HapticsAvailable` liefert false. Weder Tests noch Oberfläche behaupten eine ausgeführte Vibration.

## Save-Vertrag

Unity-Save-Version 16 ergänzt Einstellungen in Hauptspiel und isoliertem Challenge-Snapshot. Versionen 1–15 bleiben lesbar. Der bisherige `reducedMotion`-Wert bestimmt bei der Migration die Effekteinstellung; Musik und Haptik bleiben entsprechend dem Originalstandard aus. Die Originaldatei wird vor dem ersten v16-Schreiben unverändert als versionsbezogene Migrationskopie erhalten. Fehlende v16-Einstellungen, unbekannte Sprachen und ungültige Lautstärken sperren das Original. Kein Webimport und kein Zugriff auf Browser-/Capacitor-Saves in diesem Abschnitt.

## Story · separater Zwischenstand

38 Originaldialoge und fünf Kapitel sind exportiert, einschließlich vorhandener Sprachfallbacks und dynamischer Platzhalter. Der reine Zustandsautomat wird mit 445 tatsächlich ausgeführten TypeScript-Schritten verglichen. Vorbereitete Triggerzustände sind im Fixture ausdrücklich gekennzeichnet; sie belegen keinen natürlichen Lauf. Dialogkatalog und Zustandsautomat allein zählen **nicht** als vollständige Mira-Anbindung. Persistente Ereignisbelege, alle Tutorialziele und ihre erreichbare Führung sowie die Runtime-/Recovery-Anbindung sind noch erforderlich.

## Bisherige Prüfungen

- Vollständige EditMode-Suite für Einstellungen/Save: **85/85**, `/tmp/unity-settings-edit.xml`.
- Vollständige PlayMode-Suite: **45/45**, `/tmp/unity-settings-play.xml`, mit synchroner Burst-Kompilierung.
- Darin: acht echte AudioClip-Imports mit positiver Dauer, erreichbare Einstellungsaktionen, gespeicherte Sprache/Kaufmenge, Reload, französischer Hardwaretitel und wissenschaftliche Ressourcenanzeige.
- Gerenderte Breiten 320/390/430: `/tmp/unity-settings-language-{320,390,430}.png`. alle drei Profile visuell geprüft: lesbare Ressourcen, 54-Einheiten-Auswahlknöpfe und scrollbar erreichbare Einstellungen. Hauptnavigation noch nicht vollständig lokalisiert; im Restumfang erfasst.
- Erste neue Storytests scheiterten an Unitys null-Normalisierung. Geladene nullable Dialog-/Zielstrings werden ausdrücklich normalisiert; der Legacy-Kapitelvertrag wird im Fixture separat markiert. Wiederholung danach vollständig bestanden: **86/86 EditMode**, `/tmp/unity-settings-story-edit.xml`, einschließlich aller 445 Storyschritte.

Noch keine physische Audio-/Haptikabnahme, kein Playerexport und keine Geräteabnahme aus diesen Editorprüfungen ableiten.

- Typecheck bestanden; vollständiges Vitest **1.882/141 Dateien** (`/tmp/unity-settings-vitest.log`), Web-Build bestanden (`/tmp/unity-settings-build.log`). Das ist keine Unity-Playerexportprüfung.
