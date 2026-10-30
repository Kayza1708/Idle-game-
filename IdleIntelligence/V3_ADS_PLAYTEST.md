# Idle Intelligence – Unity V3: Werbung, UI und eigener Playtest

## Aktueller Implementierungsstand

Dieser Branch entwickelt **ausschließlich das Unity-Projekt**. Die bestehende Spiellogik und die sechs neuen V3-Items können ohne Werbekonto verwendet werden. Das Live-Spiel startet weiterhin mit einem neuen Spielstand in `idle-intelligence-unity-v3.json`.

### Rewarded Ads

- Unity Package Manager fordert **Ads Mediation / LevelPlay 9.6.0** an (`com.unity.services.levelplay`).
- Der Unity-Reward-Screen verwendet jetzt einen SDK-Adapter statt eines dauerhaften Platzhalters. Vor einem Video werden der Betrag, das tägliche Limit und der ggf. laufende Cooldown durch `AdRewards.Quote` bestimmt.
- Die SDK-Initialisierung bleibt aus, wenn App-Key, Rewarded-Ad-Unit oder erlaubte Einwilligungsprüfung fehlen.
- Nur **OnAdDisplayed + OnAdRewarded** darf eine Gutschrift auslösen. OnAdClosed, OnAdLoaded, Fehler, Offline und Werbung ohne Reward-Callback erzeugen **keine** Gutschrift.
- Das reguläre `AdRewards.Begin`/`Complete`-Ticket mit eindeutiger Transaktions-ID bleibt im Spielstand; die nativen C#-Tests bestätigen: Fehler ohne Reward, kein zweiter Claim, kein Claim für unbekannte IDs, dauerhaftes Speichern.
- Bei verdeckter Rewards-Ansicht läuft ein begonnenes Video weiter; das Wechseln des Tabs verwirft den bestätigten Reward nicht.
- Nur **freiwillige Rewarded-Videos**. Es wurden bewusst keine überraschenden Interstitials mitten im Spiel oder dauerhafte Banner hinzugefügt.
- Werbefrei-Rechte folgen weiterhin der vorhandenen, verifizierten Kaufberechtigung. Es werden keine In-App-Käufe, Testkäufe oder Rechnungen vorgetäuscht.

### Einrichtung in Unity für einen echten Videotest

1. Öffne das Projekt **`IdleIntelligence/`** mit der im Projekt eingetragenen Unity-Version. Im Package Manager muss `com.unity.services.levelplay` erfolgreich aufgelöst sein. In `Packages/packages-lock.json` muss der Eintrag auftauchen. Die `manifest.json` allein ist **kein Nachweis** einer installierten SDK-Version.
2. Lege in der [LevelPlay-Plattform](https://dashboard.levelplay.com/) deine **iOS- und Android-App**, je ein Rewarded-Ad-Unit und ihre **App Keys** an. Aktiviere die jeweiligen Ads-/Mediationsnetzwerke und Testgeräte. Für echte Mobile Ads benötigst du eine Entwicklungsbuild auf einem Gerät und echte LevelPlay-Kennungen.
3. Öffne **`Assets/IdleIntelligence/Resources/NativeAdConfiguration.asset`** und trage `iOSAppKey`, `androidAppKey`, `iOSRewardedAdUnit` und `androidRewardedAdUnit` ein. Diese Felder sind absichtlich leer, bis du eigene Kennungen besitzt. Keine Werbe-IDs erraten oder öffentliche Demo-IDs als Produktions-IDs verwenden.
4. Für QA auf einem Development-Build: **Einstellungen → Werbung & Datenschutz → Testanzeigen erlauben**. Dies ist eine ausdrückliche Test-Freigabe, **keine zertifizierte CMP-Einwilligung** und kein Produktionstoggle.
5. Navigiere zu **Shop → Belohnungen**. Erst wenn LevelPlay ein Rewarded Video geladen hat, werden die Video-Knöpfe aktiv. Teste Gems, Credit-Drop, Forschungszeit, Credits-Boost und Komponenten nach ihren natürlichen Freischaltungen und Limits.
6. Teste Fehlerfälle: kein Netzwerk, abgebrochenes Video, Video ohne Reward, schließen vor der Vergabe, Doppelklick, Tabwechsel, Tageslimit, Cooldown und erneutes Laden des Spielstands. Prüfe, dass keine Belohnung doppelt vergeben wird.

Offizielle Quellen: [LevelPlay Unity Package](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/package-integration), [Rewarded Ads](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/rewarded-ad-integration-package), [Datenschutz-Einstellungen](https://docs.unity.com/en-us/grow/levelplay/sdk/unity/regulation-advanced-settings).

### Datenschutz / Store-Release-Gate

**Aktueller Status: keine Produktionserlaubnis.**

- Das vorhandene Entwicklungs-Testtoggle ist keine rechtlich ausreichende Zustimmung für Google-/EEA-Werbung. Vor Release muss eine **zertifizierte Consent Management Platform (CMP)** mit passender TCF-/Additional-Consent-Übermittlung verbunden sein. Der Produktionsschalter `certifiedCmpReadyForProduction` steht absichtlich auf `false` und die interne Consent-Freigabe ist standardmäßig gesperrt.
- Vor Live-Schaltung müssen die Datenschutzrichtlinie (öffentlich erreichbare HTTPS-URL), die App Store Privacy Labels, Google Play Data Safety, Zielgruppen-/Alterseinstellungen und SDK-/Netzwerk-Datennutzung vollständig geprüft werden.
- iOS: Falls eine angebundene Werbenetzwerk-Konfiguration IDFA/Tracking verwenden will, **ATT** ordnungsgemäß ergänzen und die Auswahl respektieren. Keine ATT-Berechtigung oder personalisierte Anzeigen stillschweigend voraussetzen. Nicht-Tracking-Ausrichtung und App-Privacy-Angaben müssen zusammenpassen.
- Werbenetzwerke und SDKs müssen im jeweiligen Werbekonto als Testmodus/Testgerät konfiguriert werden. Nicht selbst auf echte Anzeigen klicken.
- Kaufpakete und Werbefrei-Käufe werden erst aktiv, wenn native Store-Adapter **und serverseitige Kaufprüfung** tatsächlich angeschlossen sind. Diese sind im aktuellen Projekt ausdrücklich noch nicht funktionsfähig.

## Einheitliches UI und nativer Mac-Test

- Alle neu erzeugten Unity-Menütexte verwenden die zentralen `GameTheme`-Farben; Buttons haben einen sicheren Pixel-Sprite-Fallback. Rewards und Einstellungen enthalten keine veraltete Meldung mehr, dass Werbung prinzipiell unmöglich sei.
- Die sechs V3-Items besitzen eigene Point-Filter-Pixelicons und den gemeinsamen Equipment-/Rarity-Rahmen.
- Menü **Idle Intelligence → V3 → Check Playtest Readiness**: Prüft in Unity Package-Auflösung, App-Keys, Datenschutz-URL, 42er-Itemkatalog, eingetragene Szenen und PixelUI-Text-/Button-Prefabs.
- Menü **Idle Intelligence → V3 → Capture Current Game Screen**: Im laufenden Spiel einen Screenshot in `Builds/V3-Screenshots/` ablegen. Vergleiche Hardware, Training, Forschung, Items, Prestige, Axiome, Shop, Belohnungen, Profil und Einstellungen auf Textüberlauf, Abstände, Touchflächen, Farben und Popup-Verhalten.
- **Idle Intelligence → V3 → Build macOS Smoke Player**: Lokaler Testbuild. iOS anschließend über **Build iOS Player** und Xcode testen.
- Die eigentlichen Unity-EditMode-/PlayMode-Suiten und der macOS-/iOS-Player müssen **noch in einem laufenden Unity-Editor** auf dem Zielgerät überprüft werden. Die GitHub-.NET-C#-CI ersetzt diese Prüfung nicht.

## Noch offen für eine Release-Freigabe

1. Verifizierter Import des LevelPlay-Pakets und tatsächliche mobile Video-Impression mit `OnAdRewarded`.
2. Google-zertifizierte CMP, ggf. ATT und veröffentlichte Datenschutzerklärung; Kontrolle aller Werbenetzwerke.
3. Native In-App-Käufe und sichere serverseitige Kaufberechtigungsprüfung (separates System).
4. Erfolgreicher Unity Editor/Player-Compile, Bildschirm- und Touch-Review aller Screens, iOS-/Android-Gerätebuild sowie Langzeit-Balancing.

**Bis dahin:** Das V3-Spiel kann ohne Werbung auf deinem Mac ausprobiert werden. Für reale Videowerbung fehlen die plattformseitigen Kennungen und abschließenden Datenschutz- sowie Build-Prüfungen.
