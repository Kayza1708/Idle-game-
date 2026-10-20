# Unity: Markt und gemeinsame Truhenvergabe

Teilabschnitt 5b auf `codex/unity-rewrite`, nach Signal-Drops. Gumball und Gem-Upgrades folgen separat; kein Gesamtabschluss des Shops oder Rewrites.

## Übertragener Umfang

Die aktuellen vier Gem-Truhen, sämtliche 20 Materialpakete, drei rotierende Tagesmaterialien, Rabatt, Tagesitem und die freie Truhe verwenden originale IDs, Preise, Mengen, Seltenheiten und Regeln. Rotation und Truhen-RNG verwenden den originalen Kampagnenhash. Tagesangebote und Cooldowns richten sich nach der monotonen Shopuhr; eine Uhrzurücksetzung erneuert weder Bestand noch freie Truhe. Revision und Tag eines Kauf-Tickets schützen gegen Doppelklicks und alte Angebote. Vergabe, Gem-Abzug, Ledger, Lagerbestand und Ergebnisbeleg sind eine Transaktion; Fehler belasten nichts.

Season-Truhen und Markt verwenden tatsächlich dieselbe Vergabe. Materialzugang, Itempool, Gewichte, RNG-Aufrufreihenfolge, Mengen- und ID-Grenzen bleiben gleich. Die ursprüngliche Realm-/Kampagnen-ID und ihr PRNG-Seed werden auch beim frischen Challenge-Lauf korrekt erhalten. Der Seed folgt der JavaScript-Codepunktiteration, einschließlich Astralzeichen.

Die Quelle verwendet im Markt eine Bestandsbesonderheit: `materialAccessible` prüft neue Materialien mit der alten Familienzuordnung, während Analysen/Synthesen V2-Gruppen verwenden. Dadurch sind z.B. Spintronik-Bauteile im Markt früher zugänglich. Die ursprünglichen zehn Materialien bleiben dort grundsätzlich zugänglich. Diese Regeln werden erhalten, nicht nebenbei angepasst. Truhen ziehen dagegen aus der V2-Analysetabelle. Kapsel-/Truhenpools schließen Impulsrelais und Erkenntnisarchiv aus; reine Materialangebote erzeugen keine zusätzlichen Familienfreischaltungen.

## Videoauftrag ohne SDK

Der gespeicherte Videopfad besitzt Kontext, eindeutige Auftrags-ID, Ablauf, Abbruch und originales Limit. Nur ein gültiger Erfolg für den passenden offenen Auftrag kann in der reinen Domain eine Truhe buchen. Die Unity-Oberfläche verwendet ausschließlich `UnavailableRewardedVideoProvider`: kein SDK, keine vorgetäuschte Werbung und kein erfolgreicher Ersatzcallback. Ein Klick meldet die fehlende Quelle und räumt den Auftrag ohne Ertrag oder Limitverbrauch ab. Unterbrechung, Kontextwechsel, falsche/alte Callbacks, Fehler und doppelte Abschlüsse sind abgesichert. Das ist die Shop-Abhängigkeit aus Abschnitt 6; alle anderen Werbe-/Kaufschnittstellen sind damit noch nicht pauschal abgeschlossen.

## Unity bedienen

`Assets/Scenes/IdleIntelligence.unity` öffnen, Play → **Forschung → Markt**. **Angebote** enthält freie und bezahlte Truhen sowie Tagesangebote. **Materialien** enthält alle Pakete und ihre tatsächlichen Sperren. **Chancen** zeigt die vier Truhentabellen und den aktuell zugänglichen Itempool. Tagesitems nutzen das gemeinsame Porträt mit Original-Slotform und Seltenheitsrahmen. Kaufen führt sofort die gespeicherte Transaktion aus; der Ergebnisbeleg erscheint darunter. Die freie Truhe ist einmal pro Originalintervall verfügbar. Alte offene Videoaufträge können ausdrücklich abgebrochen werden.

## Speicher und Nachweis

Save v12 erweitert den nativen Vertrag um Rotation, Cooldown, offenen Videoauftrag und vollständige Kaufbeleg-Metadaten. V1–11 erhalten weiterhin Originalkopien. Alte native Truhenbelege stammen ausschließlich aus Seasons; deren zuvor implizite Belegart und kostenlose Zahlung werden nachvollziehbar ergänzt, Bestände und Claims bleiben unverändert. Fehlende aktuelle Marker, ungültige Lager-/Auftragsdaten und beschädigte Originale werden nicht überschrieben. Webimport bleibt Abschnitt 8.

481 echte TypeScript-Transaktionen in 21 Szenarien vergleichen alle Angebote, Preise, Pools, Tickets, Kaufabzug, Ergebnisbelege, Lagergrenzen, Uhrzurücksetzung, Callback-Kontext und Videolimits. Die vollständige Rotation über alle 28 zugänglichen Poolitems sowie fünf Kampagnen-PRNG-Fälle sind enthalten. RNG-Fehler und fraktionale, nicht sicher buchbare historische Komponentenzähler ergeben keinen Kauf. Gem-Guthaben und erfolgreiche Providerergebnisse in technischen Fällen sind vorbereitet und kein echter Erwerbsnachweis.

Tatsächliche vollständige Regression: 61/61 EditMode- und 36/36 PlayMode-Tests bestanden. Nach erweiterten RNG-/UI-Fällen sind 3/3 Markt-/Save- und 3/3 UI-Nachtests bestanden. 1.874 Vitest-Tests in 137 Dateien, Typecheck/Build und reproduzierbarer Export sind erfolgreich. Mobile Editorbilder 320/390/430 px, Tagesitem und Chancenansicht sind visuell geprüft; [Prüfdaten](unity-market-verification.json). Echte Geräte, Veröffentlichung und Merge bleiben ausgeschlossen.
