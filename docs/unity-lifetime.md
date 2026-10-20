# Unity: dauerhafte Ereignisstatistik als Abhängigkeit von Abschnitt 3

Stand 19.10.2026. Dies ist ein geprüfter Zwischenabschnitt für Missionen/Achievements, keine Abnahme des vollständigen Abschnitts 3 oder des Rewrites. TypeScript und Balance bleiben unverändert. Folge-Draft [#133](https://github.com/Kayza1708/Idle-game-/pull/133).

## Implementiert

Alle bereits portierten Produzenten schreiben jetzt die originalen Lifetime-Metriken: gekaufte Hardware/Taschenrechner, gekaufte Klassen und Mastery-XP, bezahlte Meilensteine, normale Prestigeanzahl und dabei verdiente INT, Laborarbeitszeit, Trainings-/Forschungsstarts und -abschlüsse, hergestellte Items, gesammelte Itemtypen, Fusionen, Veredelungen, Materialzuflüsse und Materialentdeckungen, Analysen, vergütete Taps/Overdrives sowie regulär produzierte Credits/Daten und aktive Sekunden. Nicht portierte Drop-Claims bleiben ohne künstlichen Produzenten.

Taps zählen ausdrücklich nicht als reguläre Produktion. Parallel beschäftigte Labs zählen einzeln. Materialrückgewinnung wird wie `grantComponents` gezählt; bloße Bestandszuweisungen erzeugen keine Ereignisse. Mastery folgt der aktuell aktiven `hardwareOwnershipAfter`-Funktion (XP für tatsächlich gekaufte Einheiten; die ältere Testbezeichnung „only beyond 500“ ist keine neue Regel). Der Divisor und die Zahlenobergrenze werden aus der Quelle exportiert, nicht als unabhängige C#-Balance gepflegt.

`Game.Advance` erhält den expliziten Aktivitätskontext. Laden und der erste Suspend-/Focus-Resume verbuchen Abwesenheit offline. Wiederholtes Resume mit gleichem Zeitpunkt kann keine aktive Zeit oder Produktion erneut vergeben. Challenge-Labore beginnen mit frischen lokalen Zählern; die Hauptspielkopie und ihre Historie bleiben vollständig getrennt und pausieren.

Unter **Forschung → Dauerhafter Fortschritt** sind die tatsächlich erfassten Zähler und alle 15 Mastery-Stände erreichbar. Die bestehende Hochformatszene, Navigation und gemeinsamen UI-Bausteine werden verwendet.

## Migration und Grenzen

Unity-Save v7 speichert die Historie. Bestehende v1–6 behalten sämtliche bisherigen Felder und eine unveränderte Originalkopie. Weil frühere Unity-Stände keine vollständige Ereignishistorie besaßen, beginnen die neuen Zähler konservativ bei null mit sichtbarem Hinweis und Beginnzeitpunkt. Vorhandene Hardware, alte Tapzähler, Items, Equipment, INT, bezahlte Jobs und Challenge-Stände bleiben erhalten. Keine rückwirkenden Achievement-/Missionsbelohnungen und keine aus Beständen geschätzten historischen Käufe.

Der Challenge-Einstieg verwendet bei neuen Ständen wie TypeScript die tatsächlich gekauften Klassen oder aktuelle Hardware. Bei alten Ständen ohne Historie bewahren bereits persistierte Hardwareentdeckungen die bisherige Einstiegsmöglichkeit. Diese Migrationserhaltung erzeugt keine Lifetime-Ereignisse, XP oder Belohnungen.

Missionen, Kapitel-/Onboarding-Claims, Achievementkatalog/-Claims/AP-Verbraucher, Wallet/Gem-Ledger, Profil/Name/Mailbox und zwölf statische Langzeitchallenges sind weitere Arbeit des Abschnitts 3. Seasons, aktive Drops und übrige Folgeabschnitte bleiben offen. Die Statistikansicht ersetzt diese Systeme nicht.

98 gemeinsame technische Referenzfälle prüfen die bestehenden Produzenten einschließlich tatsächlicher Abschlüsse aller 20 Synthesen, Analyse-/Forgeabschluss, drei Trainingsarten, Recycling, Fusion, Online-/Offlinezeit, normale/Axiomresets sowie Challenge-Abbruch mit erhaltener Hauptspielhistorie. Finanzierte Teststände sind ausdrücklich keine natürlichen Spielfortschrittsnachweise. 42/42 EditMode-Tests und 22/22 PlayMode-Tests bestanden; nach der Textausrichtung die beiden betroffenen UI-Tests erneut bestanden. 1.864 Vitest-Tests, Typecheck, Build und unity:check bestanden. Der erste Play-Batch stürzte vor dem Testergebnis im nativen Burst-Compiler ab (Exit 138); der erfolgreiche Wiederholungslauf verwendete `--burst-force-sync-compilation`, ohne Paket-/Projekteinstellungsänderung. Mobile 320/390/430-Editoransichten geprüft. [Maschinenlesbarer Prüfbericht](unity-lifetime-verification.json); echte Geräte bleiben offen.
