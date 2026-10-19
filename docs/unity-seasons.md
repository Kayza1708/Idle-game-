# Unity: vollständige V2-Season-Belohnungen

Fortsetzung nach dem geprüften Missionscommit `9f58a5f1` auf `codex/unity-rewrite`. Kein Gesamtabschluss des Rewrites.

## Regeln und Bedienung

Alle drei aktuellen Themen sind aus `season.ts`/`economy.ts` exportiert: **Boot Sequence**, **Neural Horizon** und **Quantum Ascension**. Je 50 Level mit Free- und Premiumtrack ergeben 300 Originalbelohnungen einschließlich Gems, Materialien, tatsächlicher Items/Raritäten, Truhen und Artefakte. Themen wiederholen sich anhand der fortlaufenden Season-ID; Premium benötigt die Berechtigung für die konkrete Season-ID und wird nicht von einer früheren Season geerbt.

Die Missionsabhängigkeit liefert XP, Level, 30-Tage-Wechsel und sieben Tage nachträgliche Kulanz. Eine abgelaufene Season ohne Kulanz erzeugt keine Ersatzbelohnungen. Die vorherige Season bleibt innerhalb der Originalfrist abholbar. Claims prüfen Level, Track, Berechtigung, alte Claims und Bestands-/ID-Grenzen vor der vollständigen Transaktion. Bei vollem Truhenlager bleibt ein solcher Claim offen, bis eine verdiente Truhe geöffnet wurde. Der originale Artefakt-Einnahmenmultiplikator wirkt auf die Produktion. Items und Artefakte bleiben bei Prestige erhalten; Challenges verwenden getrennte Belege und stellen das ursprüngliche Hauptspiel wieder her.

Verdiente Truhen verwenden die vier Originaltabellen (common/rare/epic/legendary), den deterministischen Shop-Belegseed und den tatsächlichen aktuell zugänglichen V2-Material-/Itempool. Materialmenge, Itemchance und Seltenheiten bleiben unverändert. Öffnen verbraucht den Truhenbeleg genau einmal, erzeugt einen gespeicherten Ergebnisbeleg und ändert den gemeinsamen Shop-Revisionszähler. Das ist eine Abhängigkeit des späteren vollständigen Shops; dessen Rotation, Angebote, freie/video Truhen und übrige Käufe sind hier noch nicht portiert.

In Unity `Assets/Scenes/IdleIntelligence.unity` öffnen und Play drücken. **Forschung → Seasons** zeigt aktuelle Stufe/XP, Free/Premium und fünf erreichbare Levelbereiche. **Sammlung** zeigt erhaltene Artefakte und ihren Einnahmenfaktor. Bei vorhandener Kulanz kann die vorherige Season gewählt werden. Erreichte Belohnung anklicken; verdiente Truhen stehen darunter. Items verwenden das vorhandene gemeinsame Itemporträt mit Slotform und Originalrahmenfarbe. Ein erneuter Klick oder Reload zahlt nichts doppelt. Premium zeigt ohne echte Berechtigung einen gesperrten Anspruch und die noch unverfügbare Kaufanbindung; keine vorgetäuschte erfolgreiche Transaktion und kein SDK.

## Saves und Grenzen

Unity-Save v10 ergänzt verdiente Truhen, ihre nächste ID, ursprüngliche Ergebnisbelege und die benötigten Entitlement-/Transaktionslisten samt Shop-Revisionsuhr. V1–9 bleiben mit Originalkopien migrierbar. Bereits gespeicherte Missionsbaselines, Season-XP und Levelclaims werden erhalten. Für ältere Unity-Stände werden keine Premiumberechtigungen, Truhen oder Käufe erfunden. Aktive Challenge-Snapshots enthalten die neuen Pflichtdaten ebenfalls. Beschädigte aktuelle Belege und unbekannte Entitlements werden abgewiesen statt zurückgesetzt.

Die vollständigen Commerce-/Werbeverträge mit Limits, Pending-Aktionen, Verifikation und Fehlerbehandlung sind Abschnitt 6. Web-Saves werden weiterhin nicht automatisch gelesen oder teilweise importiert; expliziter validierter Import und Erhaltung noch nicht unterstützter Bestandsdaten bleiben Abschnitt 8. Legacy-Seasonkataloge und deren Webmigration sind nicht mit den drei aktiven V2-Themen gleichzusetzen.

Das Erkenntnisarchiv bleibt entsprechend dem Quellcode aus dem normalen Truhenpool ausgeschlossen. Die vorbereiteten Seasons erteilen keine Ersatzfreischaltung. Ab Season 04 verwendet die Quelle zwar weiter rotierende Themen und fortlaufende Produkt-IDs; der aktuelle Produktkatalog enthält nur die vorbereiteten Seasonprodukte. Daraus werden keine zusätzlichen kaufbaren Produkte erfunden.

## Prüfung

Die gemeinsamen Referenzen enthalten 1.017 tatsächlich ausgeführte TypeScript-Transaktionen in 21 aufeinanderfolgenden Szenarien: alle 300 erfolgreichen Trackclaims und ihre Wiederholungen, alle verdienten Truhen, fünf Forschungs-/Materialzugänge, Kulanzgrenzen, mehrere Kalenderzyklen, volles Lager, Bestandsgrenzen, kollidierende Item-ID sowie Challengeisolation/Rückkehr und Prestige. XP und Premiumrechte dieser Szenarien sind ausdrücklich vorbereitet; sie sind keine natürliche Erwerbs- oder echte Kaufprüfung.

[Tatsächlicher Prüfbericht](unity-seasons-verification.json): vollständige 55/55 EditMode- und 31/31 PlayMode-Tests; nach dem Artefaktverbraucher und zusätzlichen Erhaltungsfällen 3/3 Season-/Save- sowie 2/2 UI-Nachtests. 1.870 Vitest-Tests in 135 Dateien, danach die zwei Exportverträge nochmals erfolgreich. Webbuild mit Typecheck bestanden; vorhandene Bundlegrößenwarnung bleibt. 320/390/430-px-Editorbilder und Truhen-/Übersichtsansicht sind visuell geprüft. Echte Geräte, SDKs und Releaseabnahme sind weiterhin offen. Optischer Feinschliff wird nach dem funktionalen Port gesammelt.
