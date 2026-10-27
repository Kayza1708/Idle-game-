# Umsetzung des Bestandsaudits · laufender Auftrag

Ausgangspunkt: `5b6c3cf8`, [Audit](unity-presentation-audit-2026-10-27.md). Arbeitsbranch `codex/unity-rewrite`, Draft #155. Keine Balanceänderung, keine automatischen Übernahmen oder Löschungen von Spielerständen.

## 1. Nativer Unity-Startablauf

- [x] Eigene Einstiegsszene `Assets/Scenes/Boot.unity`, zuerst gerendertes Startbild, dann asynchrones Laden der vorhandenen Spielszene. Keine künstliche Wartezeit oder erfundene Prozentanzeige.
- [x] Originales Laborbild, vorhandene Fonts und Safe Area. Startsprache aus der Systemsprache, anschließend gespeicherte Spielsprache.
- [x] Tatsächlich initialisierten Spielstand abwarten. Bei nicht beschreibbaren Daten vorhandene Recovery öffnen; keine Belohnungen oder Saveoperationen im Bootcontroller.
- [x] Lokale/macOS- und iOS-Exportskripte verwenden denselben Szenenstart.
- [x] Unity6000.3.26f1 kompiliert; 3/3 gezielte PlayMode-Tests bestanden (5,24s): neuer Spielstand, unverändertes beschädigtes Original, englischer Save und echte320/390/430-Aufnahmen.390-Aufnahme selbst angesehen.
- [ ] Nativen Kaltstart im neu gebauten Player und physische iPhone-Safe-Area prüfen. Editoraufnahmen sind kein Gerätenachweis.

[Startbild390](media/unity-audit-followup/boot-en-390.png). Für Aufnahme wird der fertige Startzustand ausschließlich im Editor gehalten; normale Player schließen ihn sofort nach echter Initialisierung. Der vorangestellte Unity-Splash ist separat und unverändert.

## Weitere Abschnitte

- [ ] Restlokalisierung einschließlich technischer IDs und vollständiger Inhaltsübersetzung.
- [ ] Modelle, Challenges, Seasons, Shop-/Company-/Profilansichten und Einstellungen kompakt vereinheitlichen.
- [ ] Offenes Ergebnisfeedback und Analyseführung mit Mira.
- [ ] Persönliche Cloud und produktive Company-Anbindung; Anbieter-/Kontofrage offen, unabhängige Arbeit geht weiter.
- [ ] Vollregression, echte Bild-/Videoabnahme, Playerbuild, Push und Draftpflege.
