# Review-Korrektur: Shop, Queue, Menü und ZIP

## Warum der Shop auf main fehlte

Main 3012e216 enthält den Merge von PR 113. PR 114 wurde anschließend gegen den alten Arbeitsbranch codex/immersive-mobile-feedback gemergt. Der Shop kam dadurch nicht auf main. Dieser PR enthält den vollständigen Shopstand einschließlich der kantigen Rahmen direkt gegen main. Kein Merge und keine Veröffentlichung automatisch ausgeführt.

## Forschung

Ein gemeinsamer, bei Ausführung erneut geprüfter Aktions-Quote steuert normalen Start und Queue. Belegte Labore führen zum Vormerken, sofern die bestehende Queue freigeschaltet, nicht voll und das Projekt zugänglich ist. Daten werden beim späteren Start erneut geprüft und genau einmal abgebucht. Laufende oder bereits vorgemerkte Projekte erzeugen keine Duplikate. Kein zweiter Projektkatalog und keine große leere Warteschlangenbox. Vorgemerkte Projekte zeigen ihre Position statt eines Schlosses.

## Menü und Einstellungen

Sechs quadratische Menükarten mit konsistenten Icons, echter Missions-Markierung statt dauerhaftem Ausrufezeichen, Tastaturfokus und Escape. Einstellungen verwenden intrinsische Zeilenhöhen statt abgeschotteter, abgeschnittener Abschnitte. Sprache, Zahlenformat, Haptik und beide Lautstärken bleiben erreichbar. Der Profil-Fokuseffekt läuft nur beim Öffnen; Spielticks und Eingaben setzen den Fokus nicht zurück. Buildanzeige beta.2 unterscheidet den neuen Stand.

## Balanceexport

Zuvor wurden Exportstatus und Fehler nie gerendert. Der alte Download löste einen nicht angehängten Browserlink aus und gab die Blob-URL sofort frei; es gab keinen nativen Dateiexport. Jetzt: eingefrorener Snapshot, Fortschritt, abbrechbare Erstellung, ausdrücklicher Speichern-/Teilen-Klick und erneuter Versuch ohne Neuberechnung. Browserlink ist angehängt und gibt seine URL verzögert frei. Native Dateien gehen binär als Base64 in den App-Cache, von dort in den systemeigenen Share-Dialog und werden anschließend aufgeräumt. Fehlende Plugins ergeben eine sichtbare Meldung. Keine unbelegte Erfolgsmeldung „gespeichert“ nach Schließen des Teilen-Dialogs.

Die iOS-Projektdateien liegen nicht im Repository. Installation/Sync und Privacy-Manifest stehen in [native-integrations.md](native-integrations.md). Native Bridge mit Mocks geprüft, echter Xcode-/iPhone-Test offen.

## Nachweise

Browserprüfungen auf 360×640, 390×844 und 430×844: neuer Shop vorhanden, normaler Button → Queue, gespeicherte Queue nach Reload, alle neun Einstellungszeilen ohne internes Abschneiden, Eingabefokus bleibt beim Speichern erhalten, ZIP heruntergeladen. Alle drei Dateien mit ZIP-CRC und parsebarem summary.json geprüft (19 Dateien je Archiv). Neue Domain- und Bridge-Tests decken Sofortstart, Vormerken ohne Abbuchung, Doppeltippen, Reload/Autostart, gesperrten Zugang, Binärtreue, native Übergabe, fehlende Plugins, Abbruch/Retry und Browser-URL-Lebensdauer ab.

Screenshots: Menü (historischer Nachweis: Git-Historie vor Bereinigung), Einstellungen (historischer Nachweis: Git-Historie vor Bereinigung), Queue (historischer Nachweis: Git-Historie vor Bereinigung), Export (historischer Nachweis: Git-Historie vor Bereinigung).

Abschlussprüfung: Typecheck, alle 1.530 Tests in 112 Dateien, Produktionsbuild und git diff --check erfolgreich. Bestehende Warnung zur Bundlegröße bleibt. Keine reale Werbung, Zahlung, Veröffentlichung oder automatischer Merge.
