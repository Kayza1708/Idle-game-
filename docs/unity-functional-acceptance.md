# Funktionale Unity-Abnahme

Arbeitsauftrag: vollständiger funktionaler Port, danach optische Überarbeitung. Ausgang `1e0abf30`, Branch `codex/unity-rewrite`, PR #131 inzwischen gemergt; PR #132 inzwischen extern gemergt; nächster Folge-Draft für diesen Auftrag. Bestehender geprüfter Kern und TypeScript bleiben erhalten. Ein vorhandenes Menü oder exportierter Katalog zählt nicht als Abnahme.

| Abschnitt | Codeabgleich / fehlender Umfang | Abnahme |
|---|---|---|
| 1 Forschung/Industrie | Bisher 10 Forschungs-IDs, V2 tatsächlich 18 Wiederholforschungen + 8 Projekte. Fehlende Verbraucher, Foundry-Infrastruktur/-jobs/-queues, Synthese, Durchbrüche und Fragmentkonvertierung. Sechs Analysen vorhanden; Abbruch, Datenpipeline und Syntheseslot ergänzen. | V2-Kern samt UI geprüft: 221 gemeinsame Fälle, 33 EditMode/16 PlayMode; [Bericht](unity-industry.md). Dropverbraucher folgt in 5, Import/Altdaten in 8. |
| 2 Challenges | 690 aktuelle V2-Laufstufen, Regeln, Belohnungen, Hauptspielpause, Abbruch/Reload und Save-v6 implementiert. | Laufabschnitt geprüft: [Bericht](unity-challenges.md). Zwölf langfristige Challenges benötigen Metriken/Seasons aus 3/4; breite Abnahme offen. |
| 3 Missionen/Profil | Perioden, Kapitelquests, Achievements, Claims, Profil, Mailbox und Metriken fehlen. | Offen |
| 4 Seasons | Drei Originalkataloge, Free-/Premiumansprüche, XP/Wechsel, Items, Truhen und Kulanz fehlen. | Offen |
| 5 Shop/Belohnungen | Voller Shop, Gumball, Bonusboxen, aktive Drops, Angebote, Boosts, Upgrades und Entitlements fehlen. | Offen |
| 6 Adapter | Vorbereitete unverfügbare Werbe-/Kaufadapter, Limits, Pending-/Transaktionsschutz und Fehlerpfade fehlen. Keine echten SDKs oder erfundenen Käufe. | Offen |
| 7 Bedienung/Inhalte | Vollständiges Tutorial, Namensfilter, sieben Sprachen, alle Einstellungen, vorhandenes Audio und verfügbare Haptik fehlen teilweise. | Offen |
| 8 Speicher/Berichte | Expliziter Webimport, Export, bedienbare Recovery, Rückkehr-/Diagnose-/Balanceberichte und restliche Speicherverträge fehlen. | Offen |

Pro Abschnitt: reine Transaktionen und vollständige Verbraucher, erreichbare UI, gemeinsame TS-/C#-Fälle, Import/Compile, EditMode/PlayMode, gespeicherte Migrationsoriginale, Dokumentation und eigener Commit. Querschnittliche Abnahmepunkte bleiben offen, solange spätere Verbraucher fehlen. Unbekannte Importfelder werden nicht still verworfen.

## Bestandsprobleme

- Erkenntnisarchiv: V2-Lernpreis null, `canLearn` verlangt positiven Preis; gewöhnlicher Itempool schließt es aus. Keine Ersatzfreischaltung.
- Historische Unity-Saves enthalten nicht alle jetzt benötigten Statistiken. Keine rückwirkenden Belohnungen oder erfundenen Ereignisse aus aktuellen Beständen erzeugen; konservative Initialisierung und Originalkopie dokumentieren.
- `queueExperiment` erzeugt während einer Synthese beim Fehlertext einen Nullzugriff auf `experiments.active.type`. Der reine `analysisQuote` sperrt den gemeinsamen Platz korrekt. Unity sperrt die Schaltfläche und lehnt den Start ab; der gemeinsame Fall prüft das Quote statt den abstürzenden Fehlertext. TypeScript bleibt unverändert.
- Foundry: Erstes `queueForge` kann die Level-1-Station erzeugen, obwohl die Ressourcen für den Auftrag fehlen. Das ist aktuelles Quellverhalten und wird als Referenzfall erhalten.
- Bezahlte Hardwareklassen-Upgrades: Domainfunktion ist vorhanden; der Balancekommentar erklärt sie als Migration-only ohne neues ×2-Angebot. UI-Erreichbarkeit vor einer neuen Kaufoberfläche weiter abgleichen; alte Upgrades beim Webimport erhalten.
