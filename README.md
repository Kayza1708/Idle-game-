# Idle Intelligence

**Ein Unity-Projekt. Kein TypeScript, kein Capacitor, kein Web-Frontend.**

Dies ist der native Unity-Spielstand des Projekts. Der Ordner dieses Repositories ist selbst ein Unity-Projekt: `Assets/`, `Packages/` und `ProjectSettings/` liegen direkt hier. Es gibt keine alternative Webversion in diesem Branch.

## Spiel auf dem Mac öffnen

1. **Unity Hub** öffnen und **Unity Editor 6000.3.26f1** installiert lassen.
2. **Add project / Projekt hinzufügen** und diesen Projektordner auswählen (nicht einen Unterordner).
3. Im Editor `Assets/Scenes/IdleIntelligence.unity` öffnen.
4. Auf **Play** klicken und den neuen Spielstand ab 50 Credits testen.

Alternativ unter macOS aus dem Projektordner `bash scripts/open-unity-macos.sh` ausführen, dann die Szene öffnen und Play drücken. Du brauchst **kein npm**, **keinen Node-Prozess** und **keinen TypeScript-Build**.

## Frisches Spiel / bisherige Saves

Der Editor nutzt weiterhin die bestehende interne native Speicherversion, um Daten nicht durch eine kosmetische Umbenennung zu verlieren. Für einen komplett neuen Spieltest den Play-Modus stoppen und im Unity-Menü **Idle Intelligence → Playtest → Alten Editor-Spielstand archivieren** wählen. Das erstellt ein Backup statt Daten zu löschen. Danach erneut Play drücken.

## Test und macOS-App

- `bash scripts/validate-unity-macos.sh` führt Editor-Kompilierung, EditMode-, PlayMode-Tests und den macOS-Playerbuild aus. **Unity muss dafür geschlossen sein.**
- Die Testberichte liegen in `unity-acceptance/`; ein Fehler bricht den Ablauf ab.
- Alternativ im Editor: **Idle Intelligence → Build → macOS-App**.
- Der normale Spieltest direkt im Unity-Editor erfordert **keinen** vorherigen vollständigen Testlauf.

Die letzte tatsächlich auf dem Mac bestätigte Ausgangsbasis hatte **242/242 EditMode** und **138/145 PlayMode** bestanden. Die danach vorgenommenen Testkorrekturen und der endgültige macOS-Playerbuild wurden noch **nicht** durch einen neuen Mac-Lauf bestätigt. Das Repository stellt daher eine **aktuelle spielbare Testbasis**, aber keinen bereits freigegebenen App-Store-Build dar.

## Technik und Onlinebetrieb

Die Spielmechanik ist C# innerhalb von Unity. `NativeChecks/` enthält eigenständige C#-Tests. Online-Funktionen benötigen gegebenenfalls weiterhin den separat betriebenen Cloudflare-Dienst; der frühere Servercode bleibt in der Git-Historie erhalten, ist aber kein Bestandteil dieses reinen Unity-Spielprojekts.

Interne Klassen mit `V3` im Namen sind technische Daten-/Speicherschemata, keine zweite Spielversion. Bitte nicht pauschal umbenennen: Das könnte vorhandene Spielstände beschädigen.
