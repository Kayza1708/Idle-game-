# Crash-Diagnose

Der kompakte Crash-Bericht liegt getrennt vom Spielstand unter
`ai-singularity.crash-diagnostics-v1`. Er enthält höchstens 100 Aktionen sowie jeweils
20 Ticks, Saves, Fehler und Long Tasks. Er enthält Run-/Session-IDs, aber keine Namen,
IP-Adressen oder automatische Übertragung.

Vor einer relevanten Aktion wird synchron ein `begin`-Marker geschrieben, danach ein
`end`-Marker. Ein Web Worker sendet unabhängig vom Hauptthread Heartbeats. Nach einer
Blockade kann er die beobachtete Lücke melden. Während der Blockade kann der Worker
jedoch nicht auf `localStorage` zugreifen; bei einem vollständigen Browser- oder
Prozessabsturz ist deshalb nur der zuletzt bereits geschriebene Marker garantiert.
Eine zuletzt begonnene Aktion ist ein zeitlicher Hinweis und **kein Beweis**, dass diese
Aktion den Absturz verursacht hat.

Beim Start wird eine noch als laufend markierte vorige Sitzung als ungewöhnliches Ende
angezeigt. Der zugehörige Bericht bleibt zusätzlich unter einem separaten vorherigen Diagnose-Key erhalten, obwohl für
die neue Sitzung sofort ein neuer, begrenzter Bericht begonnen wird. JavaScript- und
Promise-Fehler, React-Fehler, langsame Simulationstakte, lange Saves, Savefehler,
Heartbeat-Lücken und – soweit unterstützt – `PerformanceObserver`-Long-Tasks werden
unterschieden.

## Reproduktion und konkrete Lastquelle

Ein Kernlauf mit 36 Käufen, 34 Trainings, Online-/Offline-Wechseln und wiederholten
Save-/Reload-Zyklen simulierte 981.240 Sekunden. Die bereits zuvor gemessenen 2.000
Snapshot-Grenzen führten noch zu rund 1,51 MB pro Save. Mit Hauptsave, temporärem Save
und drei Backups entstehen dabei synchrone Mehrfachkopien nahe bzw. oberhalb typischer
`localStorage`-Quoten. Außerdem wurde bei jedem schnellen wichtigen Kauf direkt im
React-Handler gespeichert, wodurch Rendering bis zum Ende der Serialisierung und der
mehreren Storage-Schreibvorgänge warten musste.

Der Fix dünnt die Snapshot-Historie jetzt adaptiv auf höchstens 300 Einträge aus und
verschiebt/coalesziert Ereignis-Saves hinter den aktuellen UI-Handler. Der unnötige 250-ms-React-Tick wurde auf einen elapsed-time-basierten Sekundentakt reduziert (rechnerisch 7.200 statt jetzt 1.800 Render-Anstöße in 30 Minuten). Im Kontrolllauf
waren es 230 Snapshots, 449.851 Byte Savegröße, 22,52 ms Savezeit, 745.220 Byte ZIP,
113,97 ms Exportzeit, 12.694 ms Gesamtlaufzeit und rund 30,19 MiB Heap-Zuwachs.
Ein echter Browserfreeze wurde in dieser Umgebung mangels lauffähiger Browser-
Toolchain nicht reproduziert; die synchrone Speicherlast ist eine konkrete gemessene
Blockadequelle, aber nicht als alleinige Ursache jedes Feldabsturzes behauptet.

## Konkreter Speicherfehler und Save-Stufen

Der direkte `localStorage`-Probezugriff war nicht der fehlerhafte Schritt. Reproduziert
wurde ein `DOMException` mit `name = "QuotaExceededError"` beim Schritt `temp-write`:
Der bisherige Ablauf hielt Hauptsave plus drei vollständige Backups und versuchte danach,
vor dem Freigeben einer Kopie einen fünften vollständigen temporären Save anzulegen. Ein
realistisch aufgeblähter v15-Zustand mit 2.000 Snapshots war 1.159.161 Byte groß; fünf
Kopien benötigen etwa 5,80 MB und überschreiten damit eine typische 5-MiB-Origin-Quota,
obwohl ein kleiner `setItem/getItem/removeItem`-Test funktioniert.

Vor jeder Persistierung werden Diagnose-/Balanceverläufe nun auch für bereits geladene
Altstände hart kompaktiert. Derselbe Zustand sank auf 300 Snapshots und 179.011 Byte.
Zusätzlich gibt der Save-Pfad die genaue Stufe, den echten Error-Namen, die Meldung sowie
Größen von Snapshot, Hauptsave, temporärem Save, jedem Backup und Logs zurück. Bei
Quota-Druck entfernt er zuerst nur die ältesten Backup-Generationen, validiert den
Temporärstand, hält dessen String im Speicher, löscht die fünfte Storage-Kopie und rotiert
erst dann die Backups. Der gültige Hauptsave bleibt bis zum atomaren finalen `setItem`
unverändert.
