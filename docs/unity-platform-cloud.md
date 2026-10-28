# Plattform-Cloud · Integrationsstand

Entscheidung nach Nutzerwunsch: persönliche Saves über Apple iCloud/GameKit auf iOS und Google Play Games Saved Games auf Android. Kein zusätzlicher kostenpflichtiger Cloudanbieter vorausgesetzt. Apple- und Google-Konten sind getrennt; plattformübergreifende Synchronisierung würde eine gesonderte Identitätsverknüpfung benötigen. Company-/Handelsguthaben bleiben serververifiziert, nicht aus hochgeladenen Client-Saves ableitbar.

## Tatsächlich implementiert

- Optionaler Bereich „Cloud-Backup“ im vorhandenen Spielstände-/Recoverymenü. Lokales automatisches Speichern bleibt unverändert; Cloud ist derzeit **ausdrücklich manuelles Backup/Restore**, noch keine automatische Synchronisierung.
- Native iOS-Brücke gegen das vorhandene Betriebssystem-Framework GameKit: Liste, vollständiges Lesen und Schreiben echter `GKSavedGame`-Daten. Kein zusätzlicher Store-/Werbe-/Analytics-SDK, kein simulierter Erfolg. Im Simulator erfolgt eine klare Nichtverfügbarkeitsmeldung.
- Drei abwechselnde Dateiplätze pro zufälliger lokaler Gerätekennung. Ein Gerät überschreibt nicht absichtlich die Slots eines anderen Geräts. Konfliktvarianten werden einzeln angezeigt, nicht nach Zeitstempel oder maximalem Guthaben automatisch ausgewählt. Keine serverseitige Kontenverknüpfung.
- Vollständiger vorhandener Unity-Save einschließlich aufbewahrter Weboriginale; gzip-Transport mit eigener Formatkennung. 2 MiB komprimiertes Transportlimit, 32 MiB entpacktes Save-Limit. Zu große Daten werden abgelehnt; kein Weglassen von Inventar, Historie oder Originalen. Dies sind technische Limits, keine Balanceänderungen.
- Downloads unverändert unter `CloudOriginals` sichern, entpacken, bestehende Versions-/Checksum-/Domainvalidierung verwenden. Kandidat bleibt bis zur ausdrücklichen Wiederherstellung vom aktiven Stand getrennt. Vorschau zeigt beide Zustände. Bestehende Recovery schützt Quelle, Hauptdatei, Backup und Pending; kein Zusammenrechnen von Fortschritt oder Rückkehrbelohnungen.
- Asynchrone Aufrufe mit einzelnen Request-IDs, Sperre paralleler Operationen und 30-Sekunden-Timeout. Veraltete/doppelte Antworten werden ignoriert. Keine Bestätigung vor erfolgreicher Plattformantwort.
- iOS-Export bindet GameKit an UnityFramework. Ohne expliziten `IDLE_ICLOUD_CONTAINER` bleibt die Cloud deaktiviert. Ein vorhandener Container kann übergeben werden; Export ergänzt dann ausschließlich iCloud Documents-Entitlements. Kein erfundenes Team oder automatischer Accountlogin.

## Tatsächlich geprüft

- Native Objective-C++-Brücke per Apple-Clang gegen iPhoneOS und ARM64-iPhoneSimulator SDK syntaxgeprüft.
- Gezielte Unity-EditMode-Prüfung: 23/23 inklusive Cloud-Snapshot-Originalerhalt, unbekannter Version, beschädigter Daten, Transportgrenzen sowie Sprach-/Mira-Referenzen. Reale Cloudoperationen sind damit nicht nachgewiesen.
- PlayMode: 18/18 im kombinierten Durchlauf einschließlich tatsächlicher Cloud-UI-Nichtverfügbarkeit sowie genau einmaliger, korrelierter Antworten. Keine echte Anmeldung oder Cloudantwort simuliert.

Am 28.10.2026 bestätigt: Nutzer besitzt noch kein Apple-Developer-Konto und keinen Google-Play-Console-Zugang. Produktive Plattformfreigabe ist deshalb ein konkreter externer Blocker. Unabhängige UI-/Sprach-/Feedbackarbeit wird fortgeführt.

## Offen bis zur echten Plattformabnahme

1. Apple Developer Team und vorhandenen iCloud-Container wählen; Unity-App-ID `com.kayza1708.idleintelligence.unity` diesem Container zuordnen. Xcode → Signing & Capabilities → Team, iCloud → iCloud Documents → vorhandenen Container. Provisioning aktualisieren. Kein Store-Upload nötig.
2. Echtes iPhone mit iCloud-Account und aktiviertem iCloud Drive; zwei Geräte/abweichende Stände, Kontoabmeldung, Netzfehler, Versionskonflikt, Reload und gezielte Original-Recovery prüfen. Unity-Simulator ist hierfür ausdrücklich kein Nachweis.
3. GameKit-Authentifizierungsbedarf für diese App am Gerät prüfen; kein eigenmächtiges Erfinden von Anmeldestatus oder Erfolg.
4. Android Build Support/SDK und offizielles Google Play Games Unity-Plugin fehlen noch. Play-Console-Spielprojekt, App-ID, OAuth-/Signaturkonfiguration, Saved Games und Testerkonto erforderlich. Androidprovider bleibt ehrlich unverfügbar. Noch kein Google-Upload implementiert oder getestet.
5. Automatischer Abgleich, explizite erste Cloud-/Lokalentscheidung, Unterbrechungs-/Accountwechselvertrag und synchronisierte Diagnoseoberfläche ergänzen und auf beiden Plattformen abnehmen. Aktuelles manuelles Backup nicht als vollständige Cloudsync ausgeben.
6. Company benötigt weiterhin konfigurierten Worker, erreichbare URL und verifizierbare Plattformidentität. Keine persönlichen Token oder Entwicklerzugangsdaten im Repository speichern.

Quellen: [Apple: Saved Games in iCloud](https://developer.apple.com/documentation/gamekit/saving-the-player-s-game-data-to-an-icloud-account), [Apple: iCloud konfigurieren](https://developer.apple.com/documentation/xcode/configuring-icloud-services/), [Google: Saved Games in Unity](https://developer.android.com/games/pgs/unity/saved-games), [Unity6000.3: AddiCloud](https://docs.unity.com/en-us/engine/6000.3/script-reference/unityeditor/ios/xcode/projectcapabilitymanager/addicloud).
