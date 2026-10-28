# Unity: Bestandsaudit von Darstellung und Vollständigkeit · 27.10.2026

## Ergebnis

Die funktionale Portierung und eine gemeinsame UI-Grundlage sind weit fortgeschritten. Eine durchgehend fertige visuelle Gestaltung, vollständige Übersetzung oder produktive Cloudanbindung sind **nicht** nachgewiesen. Vorhandene Menüs, Kataloge und bestandene Tests sind dafür kein Ersatz.

Geprüfte Spielquelle: `9ee80e60769891d513aafc69d0b114abdfeed5cc`, Dokumentations-HEAD vor Audit `9088e532`. PR #154 ist gemergt; `origin/main` (`24505da2`) und Arbeitsbranch hatten vor diesem Audit denselben Dateistand. Dieser Auftrag verändert keine Spielsysteme, Balance, Spielerstände oder nativen Installationen. Die neuen Tests verwenden ausschließlich eigene temporäre, ausdrücklich vorbereitete Spielstände.

| Thema | Nachweis und verbleibende Arbeit |
|---|---|
| Ladescreen | **Unity: fehlt.** Der bestehende individuelle Ladescreen und `docs/screenshots/loading-screen.png` gehören zur Webversion. Unity aktiviert noch den Unity-Splash; keine eigene Start-/Ladeszene, keine sichtbare Saveprüfung/Offlineinitialisierung. Ein echter Startstatus mit Fehler-/Recoverypfad und nativer Kaltstartprüfung fehlt. Keine künstliche Wartezeit oder erfundener Fortschritt nötig. |
| Gemeinsame Gestaltung | Ressourcenleiste, feste Navigation, Labor, goldene Kaufaktionen, Mira und gemeinsame Itemsockel bilden eine erkennbare Grundlage. Das bedeutet noch keine durchgängige Komposition aller Ansichten. |
| Nebenansichten | Geheimes Labor/Modellauswahl, Challenges, Company, Seasons, Profil und Verwaltungs-/Shopunterseiten enthalten weiterhin lange Textlisten, großzügige Leerflächen und große generische Aktionsflächen. Modelle zeigen technische Kürzel wie K01/revenue; Challenges technische Ziel-IDs und wissenschaftliche Zahlen. Der Shop-Einstieg besteht fast nur aus weit verteilten Textzugängen; Einstellungen füllen bereits mit der Sprachwahl den Bildschirm. Missionen zeigen übergroße, teils anders hinterlegte Zeilen. Diese Ansichten benötigen kompakte, verständliche Zusammenfassungen und nachgeordnete Details im bestehenden Stil. |
| Prestigebaum | Eigene Knotenicons und verbundenes Netz sind vorhanden. Die Aufnahme zeigt aber stark gekürzte Knotennamen und sehr dichte kleine Beschriftung. Zoom/Details sind vorhanden; Lesbarkeit und kompakte Bedienleiste bleiben eine eigene visuelle Aufgabe. |
| Animationen | Tap/Overdrive, Hardware, Herstellung/Fusion, Ausrüsten, Truhe, Gumball, Drohnenpaket und Mira haben eigene Runtime-Komponenten. Allgemeine Druckreaktionen ersetzen kein Ergebnisfeedback. Challengeabschluss und verschiedene reine Status-/Fortschrittsaktionen haben noch keine vergleichbar ausgearbeitete Inszenierung. Nicht jede Ansicht soll dauernd animieren. Dieser Audit enthält **keine erneute Videoabnahme** aller Sequenzen; frühere Clips und Tests sind historische Nachweise. |
| Sieben Sprachen | Alle sieben Sprachzustände lassen sich im Spiel speichern und aufrufen. **Inhaltlich nicht vollständig übersetzt.** Tatsächliche EN/FR/PL-Ausgaben enthalten unter anderem „Vorherige Stufe erforderlich“, „Belohnungen / Forschung“, „Dein erstes Netzwerk“, „Season-Level fehlt“. Mehrere lange Texte verwenden denselben englischen Fallback. Sprachwahl und Glyphenunterstützung sind kein vollständiger Übersetzungsnachweis. |
| Cloud/Company | **Nicht produktiv fertig.** In der geprüften Unity-Szene existiert keine konfigurierte CompanyApiClient-Instanz und keine bestätigte Sitzung. Servercode/Worker-Konfiguration und lokale API-Tests existieren; das beweist keine erreichbare produktive Anmeldung. Persönliche Cloud-Spielstandsynchronisierung inklusive Konfliktlösung ist nicht vorhanden. Lokale Saves/Import/Export sind davon getrennt. Kein Server wurde im Audit veröffentlicht oder verändert. |
| Challenges | Domainport für 10 Familien × 69 Stufen, Isolation, Rückkehr, Abbruch, Offline und Reload sowie TS-Referenzfälle vorhanden. Die tatsächliche erreichbare Oberfläche ist aber noch textlastig, teilweise unübersetzt und zeigt technische Regeln. Ein natürlicher vollständiger Durchlauf aller 690 Stufen oder eine physische Geräteabnahme ist damit nicht bewiesen. |
| Tutorial/Mira | Originalportrait, Sprechblase, interne Weiter-/Skip-Aktionen, Namenswahl, Ereignisbelege, Kapitel und gespeichertes Skip/Resume vorhanden. Frische Namenswahl zusätzlich tatsächlich in Unity aufgenommen. Neue Analysequeue, automatische Wiederholung und reservierte Offlinebudgets brauchen eine passende kurze Einführung. Späte Dialoge und sämtliche Sprachen erneut redaktionell prüfen; physische Tastatur-/Safe-Area-Prüfung bleibt offen. |
| Itemgrafiken | **36 von 36 aktuellen Katalogitems besitzen eine vorhandene, jeweils eigene Sprite-Zuordnung.** Keine gemeinsame Ersatzgrafik für alle Items. Das beweist Verfügbarkeit, nicht automatisch perfekte Artgröße jeder Seltenheit. Komponenten und Prestige-/Axiomknoten haben eigene Zuordnungen. Das Erkenntnisarchiv besitzt eine Grafik, sein ungeklärter Erwerbsweg bleibt ein getrenntes Quellproblem; keine erfundene Freischaltung. |

Echte Werbe-/Kaufanbieter bleiben absichtlich unverfügbar; es werden keine erfolgreichen Anzeigen oder Käufe simuliert. Das ist ein separat freizugebender Integrationsumfang und kein Grund, lokale Spielfunktionen als fehlend zu deklarieren.

## Prioritäten

1. Vollständige Laufzeitlokalisierung: sichtbare technische IDs, deutsche Resttexte und englische Fallbacks in allen sieben Sprachen erfassen und mit passenden Inhaltsübersetzungen schließen. Besonders Kosten, Freischaltungen, Challengeziele und Story.
2. Unity-Startablauf mit eigener Darstellung, tatsächlicher Initialisierung und bedienbarem Fehlerfall. Separat auf dem nativen Player kalt starten.
3. Geheimes Labor/Modelle und Challenges als vollständige kompakte Spielansichten ausarbeiten. Danach Seasons, Shop-/Company-/Profilunterseiten an dieselben Bausteine angleichen. Funktionen und Freischaltungen erhalten.
4. Feedbackmatrix für tatsächlich erfolgreiche Aktionen ergänzen: Forschungen/Analysen, Belohnungen, Challengeabschluss und permanente Käufe; jeweils räumlich passend, kurz, abbrechbar und reduziert darstellbar. Bereits bestehende Truhen-/Gumball-/Fusionswege nicht doppelt bauen.
5. Mira um neue Analysefunktionen erweitern und frischen sowie fortgeschrittenen Spielfluss in allen Sprachen abnehmen.
6. Cloud als eigener Integrationsauftrag: verifizierte Identität, native Konfiguration, serverbestätigte Abläufe, Fehler-/Konflikt-/Recoveryfälle und reale Ende-zu-Ende-Prüfung. Nicht mit lokaler Dateispeicherung gleichsetzen.
7. Physisches iPhone: Safe Areas, Tastatur, Touch, stabile Framezeiten, Audio/Haptik und reduzierte Bewegung prüfen. Simulator-/Editorwerte gelten dafür nicht als Gerätenachweis.

## Methode und Grenzen

Installierte offizielle uGUI- und Unity-CLI-Anleitungen sowie vorhandene Sprite-Arbeitsweise verwendet. Bestehende echte Szenen-/PlayMode-/Kamera-Testanbindung weitergenutzt. Keine Mockups, nachbearbeiteten Bilder oder neuen Grafikassets erstellt.

`PresentationAuditTests` prüft 219 tatsächliche Seiten-/Sprachzustände einschließlich Schmiedereitern und Profilunterseiten, alle 36 Item-Sprites sowie frische Namenswahl. Gespeicherte Sprache und beschreibbarer Spielstand werden ausdrücklich geprüft. DE/EN-Aufnahmen bei 390 px sowie Modelle/Challenges/Seasons zusätzlich bei 320/430 px; FR-Challenges und PL-Seasons zeigen Restübersetzungen. Das ist eine repräsentative Prüfung, **keine vollständige visuelle Abnahme sämtlicher Scrollpositionen, Sperrzustände oder Animationen**. Kleine Touchziele werden in den besuchten aktiven Zuständen geometrisch geprüft; echte Berührung/Notch/Tastatur erfordern ein Gerät.

Ein anfänglich inkonsistenter vorbereiteter INT-Ledger wurde vom Speicherschutz korrekt zurückgewiesen. Diese erste Bildserie wurde verworfen; die geprüfte Fixture erhält jetzt gültige INT-Buchhaltung. Die Modellauswahl im Test ist finanziert und kein natürlicher Spielfortschritt. Der normale Simulator-/Web-Spielstand wird nicht geöffnet oder überschrieben.

Ausgewählte unveränderte Unity-Aufnahmen und maschinenlesbare Ergebnisse: [Nachweise](media/unity-presentation-audit/verification.json). Historische Vollregressionen der unveränderten Spielquelle: 147 EditMode, 113 PlayMode und 1944 Vitest gemäß `unity-analysis-planning.md`; sie werden ausdrücklich nicht als neu ausgeführte Vollregression dieses Audits ausgegeben.

Neu ausgeführt: Unity-Import/Compile und **3/3 PlayMode-Audits bestanden**, 61,62 s, 27.10.2026. Alle 219 Zustände liefern tatsächliche Canvastexte; kein aktiver/interaktiver Button unter 43,5 logischen Einheiten in diesen besuchten Zuständen. 20 unveränderte Aufnahmen archiviert, darunter DE/EN 320/390/430 und konkrete FR-/PL-Belege. Nicht alle sieben Sprachen oder Scrollzustände wurden einzeln visuell abgenommen.

## Repräsentative Bilder

Alle Bilder stammen aus der echten Unity-Szene. Abgesehen vom frischen Mira-Start sind es isolierte vorbereitete Teststände; keine normalen Spielerressourcen.

- [Frischer Start / Namenswahl](media/unity-presentation-audit/fresh-mira-de.png)
- [Ausrüstung mit sechs belegten Sockeln](media/unity-presentation-audit/forge-inventory-de.png)
- [Modellauswahl, EN 320 px](media/unity-presentation-audit/models-en-320.png)
- [Modellauswahl, DE 430 px](media/unity-presentation-audit/models-de-430.png)
- [Challenges, französischer Sprachzustand](media/unity-presentation-audit/challenges-fr.png)
- [Seasons, EN 430 px](media/unity-presentation-audit/seasons-en-430.png)
- [Company ohne native Onlinekonfiguration](media/unity-presentation-audit/company-en.png)
- [Shop-Einstieg](media/unity-presentation-audit/shop-de.png)

Neue grafische Assets oder Fremdlizenzen: keine. Die archivierten Screenshots zeigen vorhandene Spielassets; deren Herkunft/Lizenzen bleiben in den bestehenden Assetverzeichnissen und Berichten.

Zusätzlich neu ausgeführt: `npm run typecheck` inklusive Assetprüfung erfolgreich; `npm test`: **1944/1944**, 148 Dateien, 337,60 s; `npm run build` erfolgreich (bekannte Vite-Warnung zu Chunks über 500 kB). Keine neue Voll-EditMode-/Voll-PlayMode- oder native Buildabnahme für diese reinen Audit-/Teständerungen.
