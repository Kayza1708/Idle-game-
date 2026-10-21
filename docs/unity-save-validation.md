# Unity · verlustvermeidende JSON-Prüfung

Abhängigkeit für weitere Save-Migrationen in Abschnitt 7/8, keine vollständige Speicherabnahme.

`UnitySaveCodec` prüft nun die ursprüngliche JSON-Struktur, bevor `JsonUtility` unbekannte Felder ignorieren oder ungültige Feldtypen umwandeln kann. Die Prüfung gilt für Envelope und Payload, einschließlich Challenge-Hauptzustand und verschachtelter Zustände. Sie erkennt doppelte Schlüssel, unbekannte Felder, falsche Typen, nicht ganzzahlige oder überlaufende Integer, ungültige JSON-Zahlen, unpaarige Unicode-Surrogate und nachgestellten Inhalt. Die aktuelle Version verlangt die serialisierten Felder nichtleerer Objekte; historische Versionen dürfen die später hinzugekommenen Felder weiterhin auslassen. Unbenutzte nullable Unity-Klassen dürfen als leere Objekte vorliegen; die bestehenden Domainflags und Marker prüfen ihre Bedeutung.

Unbekannte Felder sind ein ausdrücklicher Unsupported-Fehler mit Feldpfad. Sie werden nicht in einen scheinbar gültigen reduzierten Zustand umgewandelt. Die vorhandene Sperre, Prüfsumme, Originalkopie und Schreibprüfung bleiben erhalten. Auch wenn eine externe Anwendung die Datei nach einem erfolgreichen Load ersetzt, wird das veränderte Original vor dem nächsten Schreibversuch erneut geprüft und bleibt unverändert. Der Validator ist reines C# ohne Engine oder SDK.

Ressourcengrenzen: bisherige 4-MiB-Dateigrenze, maximal 64 Verschachtelungsebenen und 250.000 JSON-Werte. Zu große oder nicht unterstützte Dateien bleiben gesperrt erhalten; kein Abschneiden oder automatisches Überschreiben. Ein künftiger Import muss seine vollständige Konvertierung separat validieren und die Originaldatei kopieren. **Dieser Validator ist noch kein Web-Save-Importer.**

Prüfung: erste 8/8 Parser-/Roundtriptests bestanden, danach vollständige EditMode-Suite **96/96** (`/tmp/unity-raw-save-edit.xml`), einschließlich zweier tatsächlicher Dateisystemfälle mit externer Ersetzung und weiterem Saveversuch. Dabei bleiben Originalbytes erhalten und es entsteht keine neue Pendingdatei. Vorhandene Save-Migrationen und die natürliche Erstprestige-Referenz bestehen weiter.

Offen bleiben insbesondere Web63-/Legacy-Feldabbildung, explizite Importvorschau und Originalkopie, Unity-Dateiexport/-zustellung, bedienbare Recovery, Rückkehrbeleg, vollständige lokale Ereignis-/Runhistorie und Diagnose-/Balanceexporte. Keine automatische Übernahme aus Web-/Capacitor-Speichern.

Vollständige PlayMode-Wiederholung nach der Codec-Änderung: **45/45**, `/tmp/unity-raw-save-play.xml`. Bestehende echte UI-Transaktionen, Reload-/Fehlerfälle und mobile Einstellungsprofile bestehen.

Eine zusätzliche Wiederholung zeigte bei der JSON-Rücklesung der akkumulierten aktiven Sekunden eine einzelne binäre Rundungsstelle (`0.10099999999999999` gegenüber `0.10100000000000001`). Nur der persistierte Zeitvergleich verwendet nun 1e-12 Sekunden Toleranz; der In-Memory-Vergleich beim Resume bleibt exakt und die Spielberechnung unverändert. Foreground-Audio wird bei automatisch gesicherten Transaktionen erst nach erfolgreichem Save ausgelöst; bei Rollback bleibt es aus.

Abschließende PlayMode-Wiederholung nach der Zeitvergleichskorrektur und Save-vor-Audio-Reihenfolge: **45/45**, `/tmp/unity-raw-save-play-verified.xml`. Separater Unity-Batch-Compile ebenfalls erfolgreich; Log `/tmp/unity-settings-save-compile-final.log`.
