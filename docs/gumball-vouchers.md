# Gumball-Gutschein: Implementierung und Visual-/Release-Check
Stand 22.10.2026, Feature-Branch feature/gumball-ticket-rewards, Draft-PR #149. Nicht veröffentlicht oder gemergt.

## Design
Ein violettes Sci-Fi-Ticket mit goldener Einlösekante und bunten Gumball-Kapseln. Websprite: public/assets/game/gumball-voucher.svg. Unity: Runtime/VoucherSprite.cs zeichnet eine stilistisch verwandte, kompakte Pixel-Art-Sprite ohne Fremdassets. Ein hochauflösendes isoliertes Konzeptbild existiert zusätzlich im Chat; es ist nicht automatisch ins Unity-Projekt importiert. Die native Pixel-Variante ist gestalterisch noch nicht auf dem Gerät abgenommen.

## Funktion
- Genau **1 Gutschein = 1 normale zusätzliche Ziehung**, ohne Gems und ohne Verbrauch des Ad-Kontingents.
- Nicht handelbar, nicht online übertragbar; aktuell lokale Spielerökonomie. Aus lokalen Saves dürfen niemals serverseitige Company-Items oder Gems gemintet werden.
- Kisten haben unabhängige Chancen pro Öffnung: Common 0,5%, Rare 1%, Epic 1,5%, Legendary 2%. Tägliche Bonuskiste 0,25%. Die bereits vorhandenen Material-/Itemchancen bleiben unverändert. Shop zeigt Chancen auch vor Gems-Kistenkäufen an.
- 30-Tage-Seasons V2: 1 garantierter zusätzlicher Gutschein auf Free-Level 30 und 1 auf Premium-Level 40. Die Tickets ergänzen andere Rewards; sie ersetzen keine vorhandenen.
- Die Quoten sind *erste Balance-Hypothesen*, keine nachgewiesenen optimalen Conversion-/Retention-Werte. Im frühen Nutzer-Test messen: Gutscheinquellen, Ziehungen, Session Length, D1/7/30 und Gumball-Umsatz pro DAU.

## Sicherheit und Spielstand
- Ticket-Wallet zählt kumulativ verdient/verbraucht, verfügbar = verdient minus verbraucht, max. 999 verfügbare; keine negative/überlaufende Zählung.
- Kistenrolle aus deterministischem Campaign+Receipt-Schlüssel, unabhängig von erneutem Öffnen oder kosmetischer Animation; Shop-/Season-/Bonusbox-Claims waren bereits einmalig verbucht.
- Ziehung gibt vollständige normale Gumball-Beute und verbraucht einen Gutschein in derselben reinen Zustandsänderung.
- TypeScript berücksichtigt alte Saves ohne Ticket-Feld als Nullbestand, nicht als Anspruch auf rückwirkende Tickets. Unity: Save-Envelope von v21 auf v22, alte v21/ältere Saves bleiben mit Originalkopie erhalten, neue RewardState-Felder und Receipts werden mit geprüft.
- Keine Möglichkeit, lokale Gutscheine als echte bezahlte Währung oder online handelbare Ware in Cloudflare einzureichen.

## Teststatus
- TypeScript/Vitest: neuer gumballVouchers.test.ts (Accountstart, normale Gumball-Tickets, Reload, Missbrauchsgrenzen, Season-Klaim-Boni, feste Chancen).
- Unity/EditMode: neues GumballVoucherTests.cs; Unity-Editor-Kompilierung und reale Play-/Device-Tests **noch nicht durchgeführt**.
- TypeScript/Unity-Referenzen werden reproducible über npm run unity:export aus der ursprünglichen Economy-Quelle generiert und im Feature-Branch versioniert.
- CI Game checks und alle Golden Parity-Tests müssen vor Merge grün sein. Alte Fixture-Regressions dürfen nicht als kosmetische Fehler ignoriert werden.
- Pixel-Icon und Ticket-Button bei 320/390/430 px und in allen sieben Sprachen tatsächlich ansehen. Der neue Text ist derzeit DE-zentriert in der nativen Unity-Ansicht, Lokalisierung steht offen.
- Reduced Motion, Background/Foreground, mehrere schnelle Ziehungen und Crash vor/zwischen Ziehung und Speichern testen.

## Profilgrafiken: auditierte Lücken
Bestehende Unity-Achievements und Profile besitzen technische Daten und Aktionskarten, aber die Company-Backend-Badges/Frames sind bisher überwiegend Katalogwerte statt fertiger Unity-Porträts. Hier gibt es neue **Basis-SVGs** für Bronze/Silber/Gold unter public/assets/game/profile/ als erste Stilrichtung (nicht als vollständiger Badge-Atlas oder native Integration). Derzeit fehlen insbesondere:
1. Wiederverwendbare Badges je Familie mit klaren Bronze/Silber/Gold-Varianten und 3 sichtbaren Showcase-Slots.
2. Rahmen-Sprites: Standard, Gründer, Bronze/Silver/Gold-Lab, Neon, Quantum, Event/Singularity, plus Locked/Preview/Equipped-Zustände.
3. Company-Logo/Avatar und ein durchgehendes Profil-Layout mit optionalen Stats, Company-Tag, Rang und Verifizierungsstatus.
4. Visuelles Feedback für Aufstieg, Rare Badge / seltenen Rahmen, Equip/Unequip, Wertepivatsphäre und Shopkauf.
5. Material-/Gumball-/Kisten-Icons in einem einheitlichen Sprite-System, konsistente Maße/Sockel und lokalisierte Tooltips.

## Produktempfehlungen nach Fertigstellung
1. Echte persönliche und Company-Inventar-Brücke ohne lokale Item-Duplikation vor freiem Handel.
2. Einheitliche mobile UI für 320/390/430 px und sieben Sprachen; Badge-Bibliothek aus modularem Grundkörper, Emblem und Bronze/Silber/Gold, statt Hunderter einzelner Grafiken.
3. Transparente Dropchancen und faire freiwillige Belohnungswerbung, serverseitige Ad-SSV und Echtgeld-Kaufprüfung erst mit SDK-Integration.
4. Kein Chat. Profile standardmäßig privat; strukturierte Handelsangebote und Company-Forschungsaufträge.
5. Instrumentiertes Balancing statt angenommener Erfolgsquote: Tutorial-Completion, D1/D7/D30, Time-to-Prestige, Reward-Claim-Rate, Video Completion, Retention-Kohorten, Item-Inflation.

Quelle aller Voucherswahrscheinlichkeiten und Gutschein-Mengen: src/economy.ts, automatisiert nach Unity VoucherBalance.g.cs exportiert.
