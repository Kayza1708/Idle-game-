# Verbindliche Entwicklungsroadmap

Statuswerte: **In Arbeit**, **Geplant**, **Erledigt**. Der Status und `NEXT_STEPS.md` werden am Ende jedes Auftrags aktualisiert; unerledigte Kriterien bleiben offen.

## Phase 1 – Spielbarer Kern — In Arbeit
**Ziel:** Ein abwechslungsreicher, stabiler erster Run mit aktiven und passiven Entscheidungen.

**Features:** Hardwareklassen 1–5, Mengenmeilensteine, Klassen-Upgrades, Tap/Halten, Overclock, acht Einführungsaufträge, frühe Experimente/Items, kumulatives Prestige, drei Spezialisierungen, Autokauf und belastbare Save-/Zeitlogik.

**Abhängigkeiten:** Browser-Prototyp, zentrale Economy, Save-Migration v4.

**Abnahmekriterien:** Kernmechaniken sind integriert; Formeln und Migration sind getestet; reproduzierbarer 60-Minuten- und 7-Tage-Balancebericht liegt vor; Typecheck, Tests und Build laufen in CI. Die visuelle Browserabnahme 390×844 bleibt offen, bis ein Browser mit installierten Paketen verfügbar ist.

**Nicht enthalten:** Hardware 6–15, Energie/Wärme/Nachfrage, Meta-Prestige, echte Werbung oder Käufe.

## Phase 2 – Builds und Sammlung — Geplant
**Ziel:** Runs über sammelbare Builds unterscheidbar machen.

**Features:** besondere verhaltensändernde Itemeffekte, Crafting-Ausbau, Forschungspfade und Hardware-Synergien.

**Abhängigkeiten:** validierte Phase-1-Balance und Inventar-Telemetrie aus Tests.

**Abnahmekriterien:** mindestens drei konkurrenzfähige Builds, deterministische Tests, verständlicher Vergleich und keine Pflicht-Zufallsbarriere.

**Nicht enthalten:** Hardware 6–15, Cloud-Dienste, Monetarisierung.

## Phase 3 – Langzeitprogression — Geplant
**Ziel:** Mehrwöchige Progression mit neuen Horizonten.

**Features:** vorbereiteter Katalog KI-Workstation, Server-Rack, GPU-Cluster, Hyperscale-Rechenzentrum, Photonik-Cluster, Quantenbeschleuniger, autonome KI-Fabrik, Untersee- und Orbital-Rechenzentrum, Dyson-Rechenschwarm; Prestige-Ausbau, Herausforderungen, später Meta-Prestige.

**Abhängigkeiten:** stabile Builds aus Phase 2 und Langzeitsimulationen.

**Abnahmekriterien:** Hardware 6–15 besitzt jeweils Rolle, Grafik und Tests; mehrere langfristige Ziele funktionieren ohne harte Sackgassen.

**Nicht enthalten:** Store-Release und Echtgeldsysteme.

## Phase 4 – Spielerlebnis und Testgruppe — Geplant
**Ziel:** Verständliche, barrierearme und atmosphärische Testfassung.

**Features:** Grafik-/Soundpass, Einführung, Barrierefreiheit, lokalisierbare Texte und freiwillige, datensparsame Testanalysen.

**Abhängigkeiten:** stabiler Funktionsumfang der Phasen 1–3.

**Abnahmekriterien:** moderierte Tests, Tastatur-/Touchprüfung, Reduced Motion, Kontrast- und Screenreader-Check.

**Nicht enthalten:** native Stores, verpflichtende Analysen.

## Phase 5 – Mobile und Dienste — Geplant
**Ziel:** Zuverlässige native Test-Apps und sichere optionale Dienste.

**Features:** iOS/Android, App-Lebenszyklus, Cloud-Saves, abgesicherte Leaderboards.

**Abhängigkeiten:** Datenschutzkonzept, Backend-Entwurf, Phase-4-Testresultate.

**Abnahmekriterien:** Wiederaufnahme-/Offline-Tests auf echten Geräten, Konfliktauflösung für Saves, serverseitig validierte Ranglisten.

**Nicht enthalten:** Monetarisierung und öffentlicher Launch.

## Phase 6 – Monetarisierung und Soft Launch — Geplant
**Ziel:** Faire optionale Finanzierung in einer begrenzten Testregion.

**Features:** Gem-Economy, freiwillige Werbung, Käufe, Datenschutz, Store-Vorbereitung.

**Abhängigkeiten:** neuer ausdrücklicher Auftrag, rechtliche Prüfung, native Basis.

**Abnahmekriterien:** keine Paywall im Kern, Kaufwiederherstellung, Alters-/Datenschutzprüfung und messbare faire Balance.

**Nicht enthalten:** globaler Release.

## Phase 7 – Veröffentlichung und Betrieb — Geplant
**Ziel:** Kontrollierter Release und nachhaltiger Betrieb.

**Features:** gestaffelter Release, Live-Balancing, Inhalte, optionale Events und Supportprozesse.

**Abhängigkeiten:** erfolgreiche Soft-Launch-Kriterien und Freigabe.

**Abnahmekriterien:** Crash-/Save-Ziele, Release-Checkliste, Support- und Rollbackplan.

**Nicht enthalten:** unangekündigte Mechanik- oder Monetarisierungsänderungen.
