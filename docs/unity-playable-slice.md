# Unity: erster spielbarer Abschnitt

Stand: 19.10.2026. Branch `codex/unity-rewrite`. Einrichtung separat in `ab67478` gesichert. Der gesamte Rewrite bleibt offen; maßgeblich bleibt [die vollständige Migrationsliste](unity-migration.md).

## Öffnen und mit Play testen

1. In Unity Hub **Add project from disk** wählen und `~/Idle-game-/IdleIntelligence/` hinzufügen, falls es noch nicht gelistet ist. Genau **6000.3.26f1** verwenden. Das bestehende Hauptrepository bleibt unverändert der Git-Root.
2. **Assets → Scenes → IdleIntelligence.unity** öffnen. `SampleScene.unity` ist weiterhin vorhanden, enthält aber nicht den spielbaren Abschnitt. Die neue Szene ist die aktivierte Buildszene.
3. Im Game-Fenster ein Hochformat wählen: **390 × 844**; zusätzlich **320 × 568** und **430 × 932** prüfen. Play drücken. Die Szene enthält bereits Canvas, SafeArea, Kamera, EventSystem und verdrahteten Game-Controller; kein manuelles Hinzufügen von Komponenten nötig.
4. Mit **50 Credits** starten. In **Hardware** einen Taschenrechner für **15 Credits** kaufen. Compute, Nutzer sowie Credit-/Datenproduktion steigen. Die Hardwareliste ist scrollbar; ein Klick kauft ein Gerät und zieht den angezeigten Preis ab.
5. **Tippen · Credit-Impuls** anklicken. Akzeptierte Taps haben mindestens **200 ms** Abstand. Nach **100 akzeptierten Taps** startet Overdrive automatisch: standardmäßig **×3 passive Credits für 15 Sekunden**. Die Sperrzeit läuft **60 Sekunden ab Auslösung**; Ladung kann sich währenddessen erneut sammeln. Hardware-Meilensteine können die Dauer nach den bisherigen Regeln verändern.
6. Nach erstem Tap und Hardwarekauf führt der frühe Tutorialzustand zum Tab **Training**. **Qualität** erstmals kostenlos starten (20 Arbeitssekunden, durch Compute etwas schneller). Weitere Qualitätstrainings und Effizienz kosten Credits. Ein Trainingsplatz; Dauer und Kosten werden angezeigt. Währenddessen kann Forschung parallel laufen.
7. Unter **Forschung** die erste **Datenerzeugung** kostenlos starten (20 Sekunden). Danach kosten Wiederholungen Daten; die frühen Kosten-/Zeitstaffeln und Voraussetzungen stammen unverändert aus TypeScript. Enthalten sind Datenerzeugung, Modellarchitektur, Compute-Optimierung, Nutzer-Skalierung und Kommerzialisierung. Ein Forschungsplatz.
8. **Sichern** drücken oder die automatische Speicherung abwarten. Play beenden und erneut starten: Hardware, Ressourcen, Jobs, Tap-RNG und Overdrivezustand bleiben erhalten. Für den Offline-Test nach einem Kauf Play beenden, einige Zeit warten und erneut starten. Die Rückkehrmeldung zeigt den tatsächlichen Creditzuwachs. Ein sofortiger weiterer Neustart zahlt denselben Zeitraum nicht erneut aus. Lange Abwesenheit wird auf die bestehende Offlinekapazität begrenzt.

Die Szene beginnt nach der Namens-/Prologphase mit dem frühen Tap-Tutorial; die vollständigen Dialoge sind noch nicht portiert. Der PlayMode-Test schließt Jobs durch kontrollierten Zeitfortschritt ab; dies ist kein Nachweis natürlicher Langzeitbalance.

## Speicherpfad und Fehlerfälle

Die Datei heißt **`unity-slice-v1.json`** unter `Application.persistentDataPath`. Mit den vorhandenen Projekteinstellungen ist das auf macOS normalerweise `~/Library/Application Support/DefaultCompany/IdleIntelligence/`. Die genaue Auflösung hängt von Plattform und Unity-Einstellungen ab. Dazu gehören `.backup` und bei unterbrochenen Schreibvorgängen `.pending`. Web-/Capacitor-Saves und das bestehende iOS-Projekt werden nicht gelesen oder verändert.

Formatkennung `idle-intelligence-unity-slice`, Version **1**, separater Payload mit SHA-256-Prüfsumme. Die Prüfsumme erkennt Beschädigungen; sie ist kein Manipulationsschutz. Temporär schreiben, auf Datenträger flushen, zurücklesen und validieren, danach auf demselben Volume atomar ersetzen. Das Backup enthält den vorherigen gültigen Hauptstand. Jobs besitzen explizite Anwesenheitsflags, weil Unity JSON optionale Klassen nicht verlustfrei als `null` abbildet. Exakte Zahlenrestterme werden mitgespeichert.

Unbekannte Versionen werden nicht durch ein Backup oder NewGame ersetzt. Bei beschädigtem Hauptstand kann ein gültiges Backup zur Ansicht geladen werden; Speichern und Spielaktionen bleiben gesperrt. Vorhandene Pendingdateien sperren ebenfalls neue Schreibvorgänge. Auch eine externe Änderung nach dem Laden wird vor dem nächsten Schreiben nochmals validiert.

Für einen bewussten neuen Testlauf zuerst Play beenden und **den gesamten Save-Dateisatz außerhalb seines bisherigen Ordners sichern**, danach aus dem aktiven Saveordner verschieben. Bei Recovery Original und Pending/Backup separat aufbewahren; keine beschädigten oder unbekannten Dateien einfach überschreiben. Eine komfortable Recovery-/Importoberfläche ist noch offen. Die automatisierten Tests verwenden ausschließlich eigene temporäre Verzeichnisse.

## Aufbau und Referenzvertrag

- `Assets/IdleIntelligence/Core`: unabhängige C#-Assembly (`noEngineReferences`), reine Zustandsübergänge und injizierte Zeit. `ScientificNumber` nutzt dieselbe dünn besetzte, vorzeichenbehaftete Basis-10⁷-Darstellung wie TypeScript; große Zahl minus kleine Zahlung verliert ihre Restterme nicht. Potenzen/Division behalten den bisherigen Näherungscharakter.
- `Balance.g.cs` wird mit **`npm run unity:export`** erzeugt; **`npm run unity:check`** prüft Reproduzierbarkeit. Keine handgepflegten Inspector-Balancewerte. Primäre Werte stammen aus `src/economy.ts`; bestehende Tutorialschwelle, Simulationsgrenze und Start-RNG werden aus den aktuellen Referenzmodulen übernommen. Der Quellhash umfasst Economy, Progression, Simulation, Zahlen, Arbeit und Story. Keine Balanceänderung.
- `Tests/EditMode/ReferenceCases.json`: **24 gemeinsame Transaktions-/Ratenfälle** und **8 exakte Zahlenfälle**, erzeugt durch tatsächliche TypeScript-Funktionen. Geprüft werden Quotes, Einzelzahlungen/-einnahmen, Bestände, Käufe, Jobverträge/-abschlüsse, Voraussetzungen, Tutorialangebote, RNG, Tapabstand, hundertster Tap, Comboverfall, Overdrive-Cooldown, Produktionsfaktoren und Offlinekapazität. Approximative Raten werden mit einer Log10-Toleranz von `2e-11` verglichen; exakte Restterme und ausgewählte Transaktionen ohne Toleranz. Das ist Parität des definierten Abschnitts, keine vollständige GameState-Parität.
- `Runtime`: Unity-Adapter für Zeit, Lifecycle, JSON und Darstellung; Vorschau alle 0,1 s, Autosave alle 5 s plus sofort nach Aktionen/Pause/Fokuswechsel. Diese Darstellungs-/Speicherintervalle steuern keine Produktionsrate. Die gemeinsame Zeitmarke verhindert Wiederholung bei mehreren Resume-/Load-Aufrufen. Es wird kein Fortschritt aus Framezahl berechnet.
- `Prefabs/ActionCard.prefab`: wiederverwendbare Hardware-, Trainings- und Forschungskarte mit echten Buttonbindungen. Die Szene besitzt eine reagierende SafeArea, responsive Ressourcenleiste und eine scrollbar gefüllte Aktionsliste. Primäre Touchflächen sind bei 320 px Breite mindestens 44 px hoch. Keine kosmetischen Bewegungen oder Rückkehr-Effektserien in diesem Abschnitt.
- `Editor/CreateSliceScene.cs`: reproduzierbare Szenen-/Prefab-Erzeugung über **Idle Intelligence → Rebuild playable slice scene**. Nur bewusst ausführen: Die generierte Szene und das Prefab werden dabei neu aufgebaut. Atlas-Bounds werden aus `src/GameArt.tsx` übernommen; bestehende GUIDs bleiben beim Wiederaufbau erhalten.
- Labor aus `public/assets/game/lab-detailed-v2.webp` verlustfrei nach PNG konvertiert; Hardwareatlas unverändert kopiert, einzelne Sprite-Ausschnitte daraus erzeugt. Originale bleiben erhalten. Die UI nutzt vorerst Unitys eingebaute Schrift.

## Tatsächlich geprüft

Die maschinenlesbare Zusammenfassung steht in [unity-slice-verification.json](unity-slice-verification.json). Rohlogs bleiben lokal unter `/tmp/idle-intelligence-*.log`; sie werden wegen möglicher Lizenz-/Zugangsdaten nicht eingecheckt.

- Separater Baseline-Import/Compile vor Implementierung: Exitcode 0, Unity 6000.3.26f1.
- Szenenerzeugung mit erneutem C#-Compile: Exitcode 0.
- EditMode: 13 Tests, einschließlich der oben genannten gemeinsamen Fälle sowie Reinheit, exakte Zahlungen, Zeitsegmentierung/Reload, Offline-Cap, atomarem Replace, Backup, zukünftiger Version, beschädigtem Save, fehlendem Hauptstand, unterbrochenem Pending und externer Beschädigung.
- PlayMode: 3 Tests für verdrahtete UI-Aktionen mit echten Ressourcen, Jobabschlüsse, SafeArea, Speichern/Reload sowie schreibgeschützte Recovery. Gerenderte Profile 320×568, 390×844 und 430×932 visuell geprüft; daraus [Hochformatvorschau](screenshots/unity-playable-slice.png).
- `npm run typecheck`, `npm test` (124 Dateien / 1.845 Tests), `npm run build` erfolgreich. Nach Erweiterung der Referenzfälle den betroffenen Exporttest separat erneut geprüft. Bekannte Warnung zum großen TypeScript-Hauptbundle bleibt bestehen.

## Verbleibende Lücken

**Kein vollständiger Rewrite und keine Releaseabnahme.** Noch nicht enthalten sind insbesondere INT-/Prestige-/Axiomfortschritt und dessen Ledger/Resets, weitere Forschungsbereiche/-projekte, weitere Labs und Warteschlangen, Integrationstraining, Materialien und die Materialbelohnungen bezahlter Hardwaremeilensteine, Baupläne, Items/Builds/Equipment, Forge/Fusion/Modelle, Analysen, Automation, Challenges, Missionen/Achievements, Seasons, Shop und vorbereitete Monetarisierung. Diese Systeme werden im TypeScript-Spiel erhalten; ihre Felder werden nicht verlustbehaftet in das Slice-Saveformat importiert.

Vollständiges Onboarding mit Namensprüfung, sieben Sprachen, originale Schriften, Animationen, Audio/Haptik, Import/Export-/Recoveryoberfläche und Diagnose-/Balanceexports stehen aus. Noch keine echte iPhone-/Android-/Safe-Area-/Touch-/Screenreader-/Suspend-Abnahme, kein Player-Build und keine natürliche Langzeitbalance dieses Unity-Ports. Es wurden keine neuen nativen, Werbe- oder Kauf-SDKs installiert, nichts veröffentlicht und nichts gemergt.
