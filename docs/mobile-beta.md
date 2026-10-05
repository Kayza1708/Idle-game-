# Mobile-Beta (Capacitor)

Die Mobile-Hülle verwendet denselben Vite-Build wie die Browserfassung (`dist/`). App-Name und Bundle-ID sind zentral in `capacitor.config.json` als **AI Singularity** und `com.kayza1708.aisingularity` festgelegt. Es gibt keine zweite Spielimplementierung, keine Store-SDKs, Werbung, Accounts oder Produktionssignierung.

## Voraussetzungen und Status

- Node.js 20 und die bestehenden npm-Abhängigkeiten.
- Android: Android Studio, Android SDK, JDK 17.
- iOS: macOS, aktuelle Xcode-Version und ein für lokale Geräteentwicklung eingerichtetes Team.
- Die Capacitor-Pakete konnten in der vorliegenden Umgebung **nicht installiert** werden: die Registry beantwortete den Abruf von `@capacitor/core` mit HTTP 403. Deshalb wurden hier noch keine `android/`- oder `ios/`-Verzeichnisse erzeugt und kein nativer Build als bestanden markiert.

Sobald die Registry erreichbar ist:

```bash
npm install @capacitor/core @capacitor/app @capacitor/haptics @capacitor/keyboard
npm install --save-dev @capacitor/cli @capacitor/android @capacitor/ios
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Die erzeugten Plattformdateien müssen danach auf Portrait begrenzt werden:

- Android: Beim Haupt-`activity`-Eintrag in `android/app/src/main/AndroidManifest.xml` `android:screenOrientation="portrait"` setzen.
- iOS: In `ios/App/App/Info.plist` unter `UISupportedInterfaceOrientations` nur `UIInterfaceOrientationPortrait` eintragen (bei Bedarf ebenso für iPad).

Die Keyboard-Konfiguration verwendet Body-Resize. Safe Areas werden im gemeinsamen CSS über `env(safe-area-inset-*)` berücksichtigt. Alle Spielassets und Fonts stammen aus dem gebündelten Web-Build; der Spielstart benötigt kein Netz.

## Bauen und starten

Web-Build und Synchronisierung:

```bash
npm ci
npm run build
npx cap sync
```

Android Studio öffnen und eine Debug-APK bauen:

```bash
npx cap open android
cd android
./gradlew assembleDebug
```

Die APK liegt anschließend unter `android/app/build/outputs/apk/debug/app-debug.apk`. Das ist keine Store-Signierung.

iOS in Xcode öffnen:

```bash
npx cap open ios
```

Danach in Xcode ein lokales Development Team und ein physisches Gerät wählen und **Run** ausführen. Ein iOS-Build ist nur unter macOS mit Xcode und passender Entwicklungssignierung möglich.

## Lebenszyklus, Speichern und Zurück

Die native Brücke leitet `appStateChange` an denselben Save-/Offline-Pfad wie `visibilitychange`. Ein gemeinsames Gate verwirft doppelte Native-/Browser-Signale: Beim Hintergrundwechsel wird zuerst gespeichert und Audio pausiert; bei der Rückkehr läuft genau eine zeitbasierte Simulation. Android Zurück schließt der Reihe nach Rückkehrbericht, Profil und Ausrüstung, wechselt danach zur Werkstatt und beendet die App erst bei einem weiteren Zurück-Signal. Capacitor-Haptics wird nur über die bestehende, einstellungsabhängige Haptikfunktion aufgerufen; der Browser-Vibrationsfallback bleibt erhalten.

Importe laufen weiter durch die bestehende validierte Save-Funktion. Ein beschädigter oder inkompatibler Import ersetzt den aktiven Stand nicht. Crash- und Balancebericht sowie Save-Export bleiben lokale Downloads. Der Testspielstand-Reset ist nur für als Teststand markierte Saves aktiv und fragt optional nach einem Export sowie anschließend nochmals destruktiv nach.

## Checkliste auf realen Geräten

- [ ] Erststart und Tutorial ohne Netzwerkverbindung.
- [ ] Hardwarekauf; danach Training, Forschung und Analyse starten/abschließen.
- [ ] Crafting starten, App in den Hintergrund schicken und zurückkehren; genau einen Rückkehrbericht und keine doppelte Simulation prüfen.
- [ ] App vollständig schließen/öffnen; Tutorial- und Spielstandfortschritt müssen erhalten bleiben.
- [ ] Normalen Prestige durchführen und genau einen Sound/Haptikimpuls prüfen.
- [ ] Spielstand exportieren, validiert importieren und Crash-/Balancebericht exportieren.
- [ ] Im Flugmodus spielen, speichern, beenden und erneut öffnen.
- [ ] Musikpause/-fortsetzung sowie aktivierte und deaktivierte Haptik auf iOS und Android prüfen.
- [ ] Android-Zurück mit Rückkehrbericht, Profil, Ausrüstung, Unterseite und Werkstatt prüfen.
- [ ] Softkeyboard, Safe Areas und Portrait bei kleinen sowie großen Geräten prüfen.

