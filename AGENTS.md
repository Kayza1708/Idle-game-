# Repo-Arbeitsregeln – Unity ist das Produkt

- **Produktiver Spielcode:** `IdleIntelligence/Assets/IdleIntelligence/Core` (C#) und `.../Runtime` (Unity). Neue Mechaniken, Balanceanpassungen, Grafiken und Monetarisierung ausschließlich dort umsetzen, sofern der Auftrag nicht ausdrücklich das alte Webprojekt betrifft.
- `src/`, `scripts/`, `public/`, `package*.json` und Capacitor sind Legacy-/Generator-/Referenzquellen. **Nicht ohne nachgewiesene native Parität löschen, nicht als aktive zweite Spielversion weiterentwickeln.**
- Für Unity-Gameplay feste, überprüfbare C#-Balance-/Effektquellen verwenden. Historische `*.g.cs`-Exporte können noch von TypeScript abhängen; diese Abhängigkeit sichtbar erfassen und nicht durch ungeprüfte manuelle Änderungen am Generatoroutput verdecken.
- Alle neuen/reparierten Mechaniken mit nativen C#-Core- und Unity-EditMode-/PlayMode-Tests abdecken. Bei Release-/Grafikänderungen Unity-Editor/Player tatsächlich bauen und UI bei kleinen mobilen Auflösungen ansehen. Ein bestandenes `dotnet`-Core-Projekt ist **kein** nativer Unity-Player-Build.
- V3-Spielstände versionieren, atomar speichern und bei Fehler nicht überschreiben. Neue Kampagnen starten in der eigenen nativen Unity-V3-Datei. Altsaves werden nicht zur produktiven Voraussetzung.
- UI konsistent und mobile-first: Safe Area, 44px-Touchziele, klarer Informationsvorrang, Farben/Fonts über `GameTheme`, sieben Sprachen und reduzierte Bewegung.
- Keine gefälschten Werbe-/Kaufbestätigungen. Rewarded Ads nur bei bestätigtem SDK-Callback, nutzerseitiger Einwilligung und Store-/Datenschutzkonformität; Käufe nur nach nachgewiesener serverseitiger Berechtigung. SDK-/Storekonfiguration ist kein Beweis für produktive Nutzung.
- Nicht verwendete Bilder, frühere Designaufnahmen oder Workflowreste nur in **einem eigenen reviewbaren Cleanup-PR** entfernen. Aktive Assets inkl. `.meta`, Lizenzen, Test- und Vergleichsfixtures behalten, bis sie nachweislich entbehrlich sind.
- Berichte den Status exakt: erledigte Implementierung, erfolgreiche native Tests, offene Editor-/Player-Abnahme, offene Produkt- und Kommerzialisierungsgates getrennt nennen. Kein ungetesteter Merge/Release.
- Laufende Aufgaben unter `IdleIntelligence/V3_NATIVE_STATUS.md`, `docs/UNITY_REPO_CLEANUP.md` sowie `docs/NEXT_STEPS.md` nachvollziehbar aktualisieren.
