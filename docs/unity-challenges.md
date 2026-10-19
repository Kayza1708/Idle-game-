# Unity: Challenge-Läufe

Stand 19.10.2026, funktionaler Abschnitt 2 auf `codex/unity-rewrite`, PR #132 inzwischen extern gemergt; nächster Folge-Draft. Kein Merge. TypeScript-Spiel und Balance unverändert.

## Implementiert

Der aktuelle V2-Katalog enthält zehn Familien mit je 69 Stufen (690 konkrete Regeln/Zielsätze). Einstieg, Vorstufen, Hardwareentdeckungen, Ausrüstungsauswahl und Netzwerkverbindungen werden tatsächlich geprüft. Hands Off, Bare Metal, Compact Stack, Data Drought, Brutal Inflation, Quality Lock, Efficiency Lock, Serial Science, Closed Supply Chain und Fragmented Network greifen in Käufe, Taps, Produktion, Training, Forschung, Itemauswertung und Analyse ein. Die Katalogdaten werden aus TypeScript erzeugt.

Ein Lauf besitzt einen eigenen Zustand und eine vollständige Hauptspielkopie. Das Hauptspiel pausiert im aktuellen V2 online und offline einschließlich bezahlter Jobs und verbleibender Boostzeiten. Beim Abbruch werden ausschließlich die ursprünglichen Hauptspieldaten wiederhergestellt. Bei Abschluss werden nur die definierten Sterne, Stufen, Bestzeiten und dauerhaften Challengefreischaltungen übertragen. Wiederholungen zahlen keine neuen Erstabschlusssterne; persistierte Lauf-IDs schützen alte UI-Callbacks und Reloads. Mindest-INT gilt bei jedem Prestige im Lauf. Modellwechsel/-erwerb, INT-Käufe und Axiomreset sind währenddessen gesperrt.

Erreichte Gesamtschwellen schalten die vorhandenen Forschungs-/Trainingsqueues, Forschungswiederholung, Analyse-/Herstellungsplaner und den Prestigeagenten wirksam frei. Familienbelohnungen wirken dort, wo die aktive TypeScript-V2-Implementierung einen Verbraucher besitzt. Keine Ersatzboni wurden ergänzt.

## Bedienung

`Assets/Scenes/IdleIntelligence.unity` öffnen und Play starten. Unter **Forschung → Challenges** Familie und Stufe wählen, Regeln/Ziele lesen, verfügbare Items und gegebenenfalls Netzwerkverbindungen auswählen. Der Einstieg verlangt einen bereits erfolgten normalen Prestige und die jeweilige Hardwareentdeckung. **Start** speichert den Wechsel vor der Navigation. Während eines Laufs zeigt dieselbe Ansicht Fortschritt, Abschlussberechtigung und **Abbrechen**; die Ressourcen und übrigen Reiter gehören dann zum Challenge-Labor. Nach Rückkehr gelten wieder die ursprünglichen Hauptspielbestände. Das Hauptspiel pausiert vollständig.

Die UI nutzt vorhandene Aktionskarten, Itemporträts und die bestehende Navigation. Keine neue Grafik- oder Animationsrunde. Die finanzierten UI-Teststände sind ausschließlich temporäre Tests und keine natürlichen Spielfortschrittsnachweise.

## Speichervertrag

Unity-Save v6 erweitert v1–5 mit Challengefortschritt und einer begrenzten separaten Hauptspielstruktur. Migration bewahrt Originaldateien; unbekannte oder beschädigte Stände bleiben gesperrt. Ein unvollständiger Lauf ohne Hauptzustand, ungültige Fortschritte oder beschädigte eingefrorene Ausrüstung werden abgelehnt. Beim fehlgeschlagenen Speichern wird der unbestätigte Wechsel zurückgenommen und die beschädigte Originaldatei erhalten. Animationen und UI vergeben keine Ressourcen.

## Referenzen und Quellabweichungen

417 gemeinsame TypeScript-/C#-Transaktionen und alle 690 exakten Katalogziele prüfen unter anderem jede Familie und jedes Kapitel, Preise, Grenzfälle, Forschungsbereiche, Mindest-INT, Abbruch, Abschluss, wiederholte Abschlüsse, zwei Tage Offlinepause, Reload und gesperrte Metaaktionen. Sehr große Produktionswerte verwenden die bestehende numerische Vergleichstoleranz; Ziel-/Kostenwerte und Zähler werden separat geprüft.

- Der Katalog nennt Inflationsfaktoren 100/150/225/350/500/750. Die tatsächlich aktive `costModifier`-Funktion verwendet für diese Familie stets **100**. Unity übernimmt den wirksamen Preis und erklärt die Abweichung in der Regelansicht.
- Data-Drought-Datenbonus und Inflations-Ownership-Bonus besitzen im aktuellen V2 keinen Produktionsverbraucher; Legacyverbraucher werden nicht als neue V2-Effekte erfunden. Sterne und gemeinsame Freischaltungen gelten weiterhin.
- Zusätzlich existieren zwölf langfristige statische Challenges in `retention.ts`. Diese benötigen dauerhafte Metriken, Achievements, Masteries und Seasons. Sie bleiben in den Folgeabschnitten offen; die gesamte Challenge-Systemzeile ist deshalb noch nicht abgeschlossen.
- Historische Web-Challengekataloge 0/1 und Webimport bleiben Abschnitt 8. Keine automatische Webübernahme und kein stilles Verwerfen solcher Daten.

Konkrete Testzahlen und Bildnachweise stehen in [unity-challenges-verification.json](unity-challenges-verification.json). Ein natürlicher vollständiger Challenge-Lauf und echte mobile Geräte sind noch nicht abgenommen. Der bereits vorhandene natürliche Lauf bis zum ersten Prestige bleibt eine separate Regression.
