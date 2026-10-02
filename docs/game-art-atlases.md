# Pixel-Art-Atlanten

Die Darstellung verwendet vier getrennte Raster ohne Modulo-Zuordnung. Alle Koordinaten sind nullbasiert und zentral in `src/GameArt.tsx` hinterlegt.

- `components-atlas-v2.png` (1983 × 793 px, RGBA, 5 × 2): Schaltkreise, Kupferspulen, Siliziumwafer, Titanlegierung und photonische Linsen in Zeile 0; Graphen, Nanoröhrchen, Supraleiter, Neuralkristalle und Quantenkerne in Zeile 1.
- `items-atlas-v2.png` (1536 × 1024 px, RGBA, 3 × 3): Quantenchip `(0,0)`, Neural-ASIC `(1,0)`, Feldscanner `(2,0)` und Datenprisma `(0,1)` sind vorhandenen Typen zugeordnet. Kühlpumpe, optischer Interconnect, Speicherbank, Kompressionsbeschleuniger und Singularitätsstabilisator bleiben reserviert und ungenutzt. Andere vorhandene Itemtypen behalten den bisherigen Atlas.
- `meta-atlas-v1.png` (1536 × 1024 px, RGBA, 3 × 2): Daily, Weekly, Monthly, Season/Vitrine, Profil und Achievements.
- `activities-atlas-v1.png` (1536 × 1024 px, RGBA, 3 × 2): geschlossene/geöffnete Drop-Kapsel, Hardwareanalyse, Architekturstudie, Artefaktsuche und Werkbank.

Die Komponenten besitzen transparente Zellhintergründe. Items, Meta und Aktivitäten werden als vollständige rechteckige Kacheln dargestellt, damit deren eingebrannte Hintergründe erhalten bleiben; es werden weder Blend-Modi noch Farbfilter verwendet.
# Prestige node fallback

The prestige atlas currently has dedicated motifs for the first three levels of the five main branches. `shoppingAgent`, `trainingPlan`, `componentScanner`, and all later branch levels intentionally share the neutral symbol at atlas cell `(3, 3)`. This explicit fallback avoids random or branch/depth-derived artwork until matching illustrations are available.

Für die Axiom-Grundseite fehlt ein eigenes Axiom-Motiv. Sie verwendet daher bewusst das vorhandene INT-Ressourcensymbol mit violetter UI-Akzentuierung; es wird keine neue oder zufällige Atlaszelle zugeordnet.

- Die Axiom-Upgradekarten verwenden vorhandene Motive: `shoppingAgent`, Hardwareanalyse und Quantenchip. Es existiert kein eigenes Atlasmotiv für Analyse- oder Werkbankplaner; bis zu einer gezielten Art-Produktion dienen diese semantisch passenden vorhandenen Motive als dokumentierter Fallback.

- Für das neue Erkenntnisarchiv fehlt eine passende Illustration. Es verwendet deshalb ein neutrales, CSS-gezeichnetes `INT`-Knotensymbol und ausdrücklich keine fremde oder zufällig zugeordnete Atlaszelle.
