# Grafikauftrag: AI Singularity

Geprüfter Source-Stand: main 2872b03 plus die bereits in Vorgängerbranches gemergten Änderungen aus #95/#96. Neue SVG-Icons sind implementiert; Rasterillustrationen werden separat beauftragt. Keine fehlende native Grafik außerhalb dieser Codebasis behauptet.

## Verbindlicher Auftrag: 32 Einzelillustrationen

21 Items und elf Materialien haben noch keine passende individuelle Rasterillustration. Sie sind jetzt mit eigenen funktionalen SVG-Motiven ausgestattet. Die neue Grafik ersetzt später das jeweilige SVG; sie erweitert keine Spielregel. Namen und IDs stammen aus dem tatsächlichen Katalog. Die Motivreferenz in der letzten Spalte entspricht dem neuen Icon, siehe [Iconübersicht](icon-preview.svg). KI-Geräte als technische Module darstellen, keine beliebigen Edelsteine.

### 21 Items

| Stabile ID / Dateiname | Spielname | Motivreferenz |
| --- | --- | --- |
| `impulse-relay` | Impulsrelais | relay |
| `insight-archive` | Erkenntnisarchiv | archive |
| `inference-router` | Inferenz-Router | router |
| `burst-processor` | Burst-Prozessor | burst |
| `legacy-controller` | Legacy-Controller | legacy |
| `sparse-decoder` | Sparse-Decoder | sparse |
| `photonic-matrix` | Photonik-Matrix | photonics |
| `quantum-coupler` | Quantenkoppler | quantum |
| `distillation-module` | Distillationsmodul | distill |
| `curriculum-module` | Curriculum-Modul | curriculum |
| `long-term-memory` | Langzeitspeicher | memory |
| `cryocontroller` | Kryocontroller | cryo |
| `manufacturing-controller` | Fertigungscontroller | manufacturing |
| `diagnostic-adapter` | Diagnoseadapter | diagnostic |
| `experiment-controller` | Versuchscontroller | research |
| `precision-scanner` | Präzisionsscanner | analysis |
| `recycling-probe` | Recycling-Sonde | recycling |
| `blueprint-archive` | Bauplanarchiv | blueprintArchive |
| `protocol-controller` | Protokollcontroller | protocol |
| `photonic-analyzer` | Photonik-Analysator | photonicAnalyzer |
| `quantum-diagnostic-module` | Quanten-Diagnosemodul | quantumDiagnostic |

### Elf Materialien

| Stabile ID / Dateiname | Spielname | Motivreferenz |
| --- | --- | --- |
| `neuralCrystals` | Memristor-Arrays | memristor |
| `ceramicCapacitors` | Keramikkondensatoren | capacitor |
| `ferriteCores` | Ferritkerne | ferrite |
| `goldContacts` | Goldkontakte | contacts |
| `ceramicSubstrates` | Keramiksubstrate | substrate |
| `opticalFibers` | Glasfasern | fiber |
| `thermalInterface` | Wärmeleitmaterial | thermal |
| `diamondSubstrates` | Diamantsubstrate | diamond |
| `spintronicDevices` | Spintronik-Bauteile | spin |
| `photonicCircuits` | Photonische Schaltkreise | photonics |
| `cryogenicResonators` | Kryogene Resonatoren | cryo |

Memristor-Arrays sind bereits implementiert, aber ihre bisherige Atlaszelle zeigt einen violetten Kristall. Deshalb zählt ihre neue technische Arraydarstellung zusätzlich zu den zehn neuen Materialien zum Auftrag. Diamantsubstrate als technische Trägerplatte zeigen; sie sollen sich klar von Gems unterscheiden. Photonik, Kryotechnik und Memristoren brauchen unterschiedliche Silhouetten.

## Format und Abnahme

- Je Motiv eine transparente PNG mit 512 × 512 px sowie editierbare Quelldatei. Dateiname exakt ID, z. B. inference-router.png oder neuralCrystals.png. Items und Materialien in getrennten Ordnern liefern.
- Stil an den vorhandenen Hardware-/Material-/Itematlanten ausrichten: isometrische Pixelillustration, dunkles Metall, Türkis/Cyan, sparsame warme Akzente. Diese Dateien und die SVG-Übersicht dienen als Referenz.
- Zentriertes Objekt, ungefähr 72–80 % der Fläche; keine Beschriftung, Seltenheitsfarbe, UI-Rahmen, eingebauten Zahlen oder deckenden Hintergründe. Silhouette muss bei 32/64 px lesbar bleiben, Details bei 96–160 px.
- Einzeldateien bevorzugen. Ein optionaler neuer Itematlas kann 7 × 3 quadratische 512-px-Zellen haben; Materialatlas 4 × 3 Zellen, letzte Zelle leer. Reihenfolge exakt Tabellenreihenfolge. Keine Änderung der bestehenden Atlanten voraussetzen.
- Abnahme: Transparenz, eindeutige Silhouette, tatsächliches Motiv, kleine Vorschau auf dunklem Hintergrund, keine abgeschnittenen Kanten. Danach getrennte Codezuordnung mit vollständiger Katalogprüfung; aktuelle SVGs bleiben bis dahin funktionsfähig.

## Optionaler zweiter Auftrag – zuerst Einsatzfläche festlegen

- Drei Schmieden: je eine Maschinenillustration; fünf Stufen durch UI-Overlays darstellen, keine 15 fast gleichen Bilder. Aktuelle Schmieden-UI braucht diese Rasterbilder technisch nicht. Erst eine passende Bildfläche in der UI festlegen, danach Größe beauftragen.
- Spätere Labor-/Rechenzentrumshintergründe: interessant für sichtbaren Fortschritt, aber aktuell kein bestätigter fehlender Assetanschluss. early-lab-pixel-art.png liegt im Repository und wird von der aktuellen UI nicht verwendet. Erst Fortschrittszustände und Darstellung definieren.
- Native Appicon-/Storegrafiken: favicon.svg existiert. Native Exporte, Storebanner und Screenshots sind in diesem Source-Stand nicht verifizierbar; mit den tatsächlich vorhandenen Plattformprojekten abgleichen. Keine pauschale Neubeauftragung des Logos.

## Bereits vorhanden / kein neuer Auftrag nötig

15 Hardwaremotive, acht Ressourcenmotive, neun passende Materialmotive und neun passende Itemmotive sind zugeordnet. Meta-/Aktivitätsatlanten enthalten bereits Kisten und Analyse-/Werkbankmotive; Mira Voss ist vorhanden. Frühe Prestigeillustrationen bleiben erhalten, spätere Prestigezweige nutzen jetzt semantische SVGs. Nicht alle unbenutzten Atlaszellen sind fehlende Funktionen: sie werden nicht willkürlich auf neue Items umbenannt. Für V1 keine 690 Challengebilder oder individuelle Rastergrafik pro Prestigelevel beauftragen.

## Technische Prüfung dieses Schritts

1.346 Tests, Typecheck und Build bestanden; acht neue Icon-/Katalogverträge. Keine neue Balance-, Save- oder Ressourcenregel durch die Icons. Die integrierten #95/#96 enthalten ihre separat dokumentierten Domainänderungen. Mobile Browser-/Geräteabnahme bleibt offen; Renderverträge ersetzen sie nicht.
