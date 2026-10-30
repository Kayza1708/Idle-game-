# V3 Industrie-Itemverbraucher – Implementierung vom 30.10.2026

**Status: Domänen-Teilabschnitt, keine 42-Item-Freigabe.** Die drei noch nicht katalogisierten Namen werden in vorbereiteten mathematischen TS-/C#-Fällen geprüft. Der reguläre V2-Spielstand bleibt unverändert und die V3-Persistenz bleibt gesperrt.

| Item | Tatsächlich implementierter Rechenpfad | Formelbezug |
|---|---|---|
| Flottenkoordinator | V3 Compute-Quote in TS `itemComputeFactorV3` und C# `ItemSystemV3.ComputeFactor` | `2^P × (1 + 0,15×P×V)`; `V` zählt **jetzt** mindestens 100 gehaltene Geräte pro Klasse |
| Synthesekoordinator | Tatsächliche bezahlte Synthesearbeit und Endzeitgrenze in TS `synthesisSpeed`/`advanceProgressionJobs`, C# `Industry.NextBoundary`/`Industry.Work` | `2^P × (1 + log10(1+K)/4)^(0,5×Q)`, wobei `K` ausschließlich bereits gebuchte, selbst produzierte Komponenten im Axiomzyklus erfasst |
| Singularitätslinse | V3 Compute-Quote in TS und C#; Exponent der rohen regulären Hardwareproduktion, nicht das gesamte Einkommen oder Wallet | `max(1,C)^(0,02×Q)`; frühestens 3 echte Axiomresets; kompletter Industrie-Dreierbuild erhöht den Exponenten ×1,5 |

## Mathematische und technische Bedingungen

- Stärke aus der bestehenden zentralen V3-Quelle `BALANCE.itemV3`. W10 verstärkt `P` und `Q` nur einmal über den vorgesehenen Fähigkeitsweg.
- Die neue Syntheseformel wird nicht auf Analysen, Data- oder Materialpreise und nicht auf Syntheseausbeute angewendet. Die bereits separat implementierte `C06`-Ausbeute bleibt unabhängig.
- Der Flottenzähler berücksichtigt weder Lifetime-Geräte noch bloß freigeschaltete Hardware. Bei einem Prestige kann er sinken.
- Die Singularitätslinse verwendet die normale hardwareseitige Klassenproduktion vor allen modell-/prestige-/axiom-/item-/temporären **globalen** Multiplikatoren und wertet den erhaltenen dritten Zyklus nur über echte `axiomResetCount` beziehungsweise `Meta.resets` aus.
- Keine Multiplikatoren aus künstlichen Shopressourcen oder fremden Items erzeugen zusätzliche `K`.

## Prüfstand

- Neue Source-Tests `src/itemV3Industrial.test.ts` prüfen die Mathematik sowie vorbereitete V3-Compute- und normale Nicht-V3-Synthesepfade. Neue Unity-EditMode-Tests `ItemV3IndustrialTests.cs` prüfen dieselben Formeln, **noch nicht in Unity ausgeführt**.
- GitHub Actions `Game checks` umfasst TypeScript-Typecheck, Vitest und Webbuild; das ist keine native Unity-Abnahme.
- Vor einer tatsächlichen V3-Abnahme müssen alle geänderten Generatoren aus der zentralen TS-Quelle mit `npm run unity:export` neu ausgeführt und die generierten `.g.cs`-/Fixture-Dateien eingecheckt werden. `npm run unity:check` muss anschließend unverändert bestehen.
- 42er-Itemkatalog, 6 sichere Rezepte, natürliche Unlock-/Drop-Sperren, 12 Kombinationen, übrige Eventfähigkeiten, Save-Migration, Originalkopie, C#-Parität, DE/EN/alle Sprachen und Xcode-Player sind **weiterhin offen**.

Dieser Abschnitt darf nicht als vollständige V3-Annahme markiert werden, solange die drei IDs nicht über die normalen Erwerbs- und Ausrüstungspfade erreichbar sind.
