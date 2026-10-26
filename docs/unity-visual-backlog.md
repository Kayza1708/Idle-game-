# Optische Überarbeitung nach funktionaler Migration

Der erste ausdrücklich beauftragte Designabschnitt ist in `unity-design-01.md` abgegrenzt. Originale Grafiken und uGUI bleiben erhalten; keine Balance-/Saveänderung.

## Abschnitt 1 · gemeinsame Grundlage

- [x] Kompakte Ressourcenleiste und dauerhafte untere Fünfernavigation.
- [x] Gemeinsame Labor-/Modell-/Trainings-/Hardwareansicht mit echter Tapfläche, Produktion und Overdrivefeedback.
- [x] Einheitliche Itembilder/Slotformen/Seltenheitsrahmen und scrollbar vollständige Details; Kosten mit Originalicons, Bestand/Bedarf und Grün/Rot.
- [x] Originalfonts samt Lizenzen in Unity nutzbar; gemeinsame Farben, Buttons/Abstände und wiederverwendbare Labor-/Ressourcen-/Navigationsprefabs.
- [ ] Physische Glyphen-/Unicode-/Notch-/Touchabnahme, Screenreader und dynamische Schriftgrößen.

## Weitere Gestaltungsabschnitte

Forschung, Analysen/Schmiede, Modelle, Shop, Seasons, Profil und Einstellungen erhalten anschließend eigene Gestaltungsdurchläufe auf dieser Grundlage. Ihre vorhandene Funktionalität bleibt bestehen. Keine pauschale Designfertigmeldung.

- Typografie/Abstände in den übrigen Bildschirmen mit den geprüften Originalfonts vereinheitlichen.
- Knotenbeschriftungen bei kleinem Zoom besser lesbar machen; Detailfenster bleiben die ausführliche Ansicht.
- Lange Modell-/Forschungs-/Planerlisten nach vollständigem Funktionsport verdichten.
- Effektfarben, Übergänge und Audio-/Haptikabstimmung gemeinsam überprüfen.
- Sichere Bereiche, große Sprachtexte, Screenreader und reale Touch-/Notch-/Suspend-Geräteabnahme.
- Umfangreiche Animationsüberarbeitung und finale Geräte-/Releaseprüfung erst nach funktionaler Abnahme.
- Erfolge/Profil: große Leerflächen des vorhandenen Aktionskarten-Prefabs nach vollständigem Funktionsport verdichten; Schrift wurde für die aktuelle Bedienung bereits vergrößert.
- Glyphen-Fallback für zulässige Unicode-Spielernamen auf echten Geräten prüfen; der reine Namensvertrag ist gegen JavaScript geprüft, Gerätefonts bleiben Abschnitt 7/Geräteabnahme.

- Seasons: Truhen-/Artefaktdarstellung und umfangreiche Belohnungslisten nach vollständiger Migration mit dem Shop optisch vereinheitlichen; Claims und Sammlung sind bereits bedienbar.

- Markt: nach vollständigem Funktionsport Truhen-/Ergebnisgrafiken, lange Materiallisten und Zeitdarstellung gemeinsam verfeinern. Chancen, Preise, Bestände und Tagesitem sind jetzt lesbar/bedienbar.

- Gems/Gumball: lange Preis-/Restzeitanzeigen und Ergebnisbereich später zusammen mit Markt/Truhen verdichten. Aktuell scrollbar, gemeinsame Porträts und mindestens 44 Einheiten hohe Bedienelemente.

- Storekatalog: vorhandene Aktionskarten nach vollständiger Funktionsmigration verdichten; Inhalte, Sperren und fehlende echte Storepreise bleiben dabei klar getrennt.

- Belohnungs-/Forschungsskipseite nach vollständiger Funktionsmigration verdichten; Auftragsidentität, Kosten und Bestätigung dabei weiter lesbar halten. Aktuelle Hochformate sind scrollbar und bedienbar.

- Einstellungsansicht: bestehende vertikale Anordnung erhalten; Sprachliste benötigt auf 320 px Scrollen. Erst nach funktionaler Abnahme optional kompakter darstellen. Noch deutsche Navigations-/Detailtexte sind funktionale Lokalisierungslücken, kein kosmetischer Abschluss.

## Nachprüfung Abschnitt 1 · 22.10.2026

Die zweite Überarbeitung ist in [unity-design-02.md](unity-design-02.md) dokumentiert: kleine Ecken, zurückhaltender Speicherzugang, einheitliche tatsächliche Itemform auch in Universalslots, Schlossreihe, kompakte Detailaktionen und echter aktueller Ausrüstungsvergleich. Unveränderte Werte/Dopplungen entfernt; reale Nachteile rot. Tapfeedback am Pointer und goldener Overdrive-Kern bleiben rein kosmetisch. Lange deutsche Inventarnamen brechen am vorhandenen Bindestrich. Kein neuer Stilentwurf für übrige Bildschirme.

Offen für spätere Geräte-/Designabnahmen:

- Symbolerkennung des kleinen Speicherzugangs und tatsächliche Touch-Ergonomie auf iPhone/Android prüfen; ausdrückliches „Jetzt speichern“ bleibt in Einstellungen verfügbar.
- Fontfallback für Pfeile, zulässige freie Spielernamen und große Systemschrift auf Geräten prüfen; neue Schloss-/Speichersymbole sind Vektoren.
- Safe Areas mit echten Notches, Hintergrund-/Fortsetzungsverhalten und reduzierte Bewegung auf Geräten prüfen.
- Anschließend bestehende Forschung/Netze/Schmiede/Shop/Seasons/Profil/Einstellungen mit diesen gemeinsamen Bausteinen bearbeiten; keine vorgezogene pauschale Umgestaltung.

## Verbindliches Zielbild · Labor/Itemdetails

Aktueller Stand: [unity-design-03.md](unity-design-03.md). Stahlhaut, Gold-/Mintaktionen und gemeinsame Pixelkanten sind echte einzelne Assets; Namen/Zahlen/Kosten/Aktionen bleiben dynamisch. Labor, Hardware und Itemdetails verwenden die neue Grundlage. Original-Seltenheitsfarben und alle Slotformen bleiben erhalten; Animationen sind begrenzt und transaktionsfrei.

Weitere Forschung/Netze/Schmiede-/Shop-/Season-/Profil-/Einstellungsansichten benötigen weiterhin ihre eigenen Layout-/Dichteprüfungen. Gemeinsam verwendete Styles allein sind keine vollständige Gestaltungsabnahme dieser Bildschirme. Physische Touch-/Notch-/Fontfallbackprüfung, Systemschriftgrößen und native Audio-/Haptikabnahme bleiben offen. Das aktuelle Originalschriftpaar wird beibehalten; eine andere Zielbildschrift ist nicht ohne Lizenz übernommen. Keine dauerhaften Itemstrahlen/Glows; begrenzte Revealpartikel statt dessen.

## Ruhige Leisten und vollständiger Aktionsnachweis

[Abschnitt 04](unity-design-04.md): Ressourcen und untere Navigation liegen jetzt auf gemeinsamen ruhigen Flächen mit feinen Trennern/aktivem Cyanindikator. Keine dekorativen Einzelkästen; Originalicons bleiben in einheitlichen Flächen. Tap/Overdrive, Kauf, Herstellung, Fusion und Ausrüsten sind mit vollständigen Bewegungsphasen und tatsächlichem Audiomix dokumentiert. Unbenutzte Materialsockel bleiben auch nach der Herstellung verborgen. Keine zusätzliche Designrunde für übrige Inhalte; physische Abnahme und weitere Bildschirmabschnitte bleiben offen.

## Inszenierung, Modell und bestehende Menüwege · Abschnitt 05

[Prüfbericht und visuelle Beurteilung](unity-design-05.md): Fusion mit großen konkreten Eingaben und Ergebnis, eigener Pixel-Spritefolge, präzisem Soundmoment und Transfer zum Inventarregister. Dasselbe Bausteinsystem für Herstellung und lokale Aktionsimpulse. Originalmodell und verbundene Sockel nach `EquipmentDialog.tsx` wieder zusammengeführt; sichtbare Itemmitte aus Alpha-Metriken. Ressourcen bleiben ruhig und zeigen echte Gems, Nutzer sind im Hamburger-Menü unter Produktion/Nutzer erreichbar. Keine neue allgemeine Gestaltung für übrige Bildschirme.

Offen bleiben insbesondere die physische Wirkung von Schrift/Touch/Notches, Systemaudio und native Haptik sowie die einzelnen übrigen Bildschirmabnahmen. Die konkrete Verbesserung gegenüber Abschnitt 04 und die funktionalen Testresultate sind bewusst getrennt dokumentiert.

## Gemeinsame Aktionssequenzen · Abschnitt 06

[Umfang und eigene visuelle Beurteilung](unity-design-06.md): gebogene beschleunigte Fusion, gestaffelte Silhouette/echter Slotrahmen/Resultat, eigener Pressen-/Dampfsprite, Truhen- und Kapselmechanik aus Originalgrafiken, gemeinsame gespeicherte Belege und Zieltransfers. Wiederverwendung und begrenzte Partikel, Kürzen/Navigation/Reload/reduzierte Bewegung. Keine Belohnung aus Animationen. Hardware zeigt Gesamtpreis und tatsächliche Menge statt Bestand/Preis. Menü-Rundgang schließt die 15 ursprünglichen Hauptrouten und nach Main-Integration den bedingten Company-Zugang mit Scrollen/Rückkehr ein; INT-Teststand ausdrücklich vorbereitet.

Offen für folgende Abnahmen:

- Physische iPhone-16-Pro-/Android-Beurteilung von Touch, Safe Areas, Framerate, Wärme/Energie, Schrift und Audio-/Haptikunterbrechungen. 402×874 mit simuliertem Ausschnitt ist kein Gerätetest.
- OS-seitige reduzierte Bewegung/Haptik ohne vorhandene native Plattformbrücke nicht als getestet ausgeben; die gespeicherten manuellen Einstellungen sind geprüft.
- Die übrigen Inhalte/Listen behalten ihre vorhandenen Layouts; der gemeinsame Menüstil ersetzt keine vollständige Layoutabnahme aller Unterseiten.
- Gemeinsamer Quellkatalog: mehrere INT-Knotennamen/-Beschreibungen in allen sieben Sprachen deutsch. Als Inhaltsübersetzung gesondert bearbeiten, keine neuen Begriffe/Balanceregeln erfinden.
- Gesamtqualität anhand der tatsächlichen Clips gemeinsam beurteilen; bestandene Tests und ein vorhandenes Effektgerüst sind keine visuelle Gleichwertigkeit mit Archero.


## Gumball Gutschein & Profil-Badges (22.10.2026)

- Neues Ticket-Artwork: Web-SVG und native UI-Pixelsprite vorhanden; Format- und Art-Differenzen bei 320/390/430 px prüfen, goldene Randkante, Kapsel und Ticketzähler über alle Menüs vereinheitlichen.
- Ticket-Ziehung verwendet bestehende Ergebnisanzeige; hochwertige Gumball-/Kistenbewegung und vollständigen echten Videonachweis noch prüfen.
- Company-Badges/Profilrahmen: Grund-SVG für Bronze/Silber/Gold ergänzt, aber **noch kein integrierter Unity-Spriteatlas** oder fertiges Profil mit 3 Showcase-Slots und Privacy-Schaltern. Benötigt modulare Grundform, Emblem pro Achievementfamilie, Bronze/Silber/Gold-Rarity, Locked/Unlocked/Preview/Equipped und Rahmen (Founder/Neon/Quantum/Singularity).
- Profilzahlen (Compute/INT/Prestiges/Spielzeit) nur bei ausdrücklicher Freigabe und verifizierter Herkunft online anzeigen; keine Social Chat-UI aufbauen.


## Profile-Badges / Bilder ergänzt (22.10.2026)

- [x] Je 3 Metallstufen der sieben Company-/Achievementfamilien als einzelne Web-SVG; acht Rahmen, Company-Wappen und Unity-kompatible Pixelvarianten im gesonderten Feature-Branch.
- [x] Lokale Unity-Abzeichen-Galerie und Schaukasten mit tatsächlich abgeholten Achievements, Web-Profil-Vorschau und markierte Season-Gutscheine.
- [ ] Kein echter Online-Company-Profil-Screen, kein kauf-/auswählbarer Profile Frame, keine profilübergreifende verifizierte Datensynchronisierung; nicht als fertig markieren.
- [ ] Effektqualität, Bildgrenzen, Text/Notch-Kontrast und Animationen in tatsächlichen Unity-Screenshots und Geräten visuell beurteilen.

- Übernommene Company-Ansicht (`main aebd1174`): englische Gate-Erklärung, aber mehrere übrige Beschriftungen noch deutsch; langer Statusabsatz ist in der vorhandenen festen Höhe gekürzt. Aktionen/Scrollen/Rückkehr werden geprüft und aufgenommen. Vollständige Quelllokalisierung und eigener Inhalts-/Dichtedurchlauf bleiben offen; keine Online-/Serverfreigabe daraus ableiten.

## Company/Profil und lokaler iOS-Weg · 23.10.2026

- Company: kompakte gemeinsame Navigation und Haupttext; vollständige Regeln aufklappbar. Dynamische Texthöhe statt Abschneiden bzw. großer fester Leerflächen. DE/EN-Grundtexte korrigiert. Keine serverseitige Freigabe daraus ableiten.
- Profil: fünf Zugänge in zwei kompakten Zeilen statt fünf großen vertikalen Buttons. Badge-Claim erhält erst nach erfolgreichem Save einen begrenzten Impuls am tatsächlich neu gebauten Badgeicon; kein zweiter Grant.
- Noch offen: vollständige Company-Onlinezustände (Mitgliedschaft, Handel, verifizierte Auszeichnungen) mit echtem konfiguriertem Server visuell abnehmen; Profile-Frame-Auswahl/-Erwerb ist weiterhin keine vorhandene funktionale Aktion. Keine zusätzlichen Previewrahmen als kaufbar darstellen.
- Profil enthält abseits der hier korrigierten Kopf-/Identitäts-/Schaukastentexte noch historische Inhaltsfallbacks. Die Layoutprüfung ist keine vollständige Siebensprachen-Inhaltsabnahme. Weitere Badgekarten-/Mailbox-Dichte und Touchflächen in einem zusammenhängenden Profilabschnitt prüfen.
- Fünf neue eigene Audiocues und echte Unity-Audioclips: `unity-ios-audio-assets.json`, `media/unity-ios-local/`. Klangabnahme auf physischen iPhone-Lautsprechern/Kopfhörern bleibt getrennt vom Editor-/Simulatornachweis.

## Hauptansichts-Reparatur und Tutorialdock · Prüfstand 23.10.2026

- Kompakte gemeinsame Kopfzeile ohne H-/Save-Glyph, randloses Labor, 72er Hardware, direkte Kaufmengenwahl und ein Shell-eigener Mira-Dock implementiert. Originalportrait/-grafiken erhalten. Selbst betrachtete echte Bilder zeigten zuvor Overlay-Verdeckung und unnötige Höhen; verantwortliche Parents/Prefabs gezielt korrigiert.
- Finger aus eigenem TS-Pixelmotiv an tatsächliches Ziel gebunden, statisch bei reduzierter Bewegung. Alle 36 DE-/EN-Bilder mit 320/390/430 px und ×1/×10/MAX wurden tatsächlich angesehen. Native Nachprüfung deckte zusätzlich fehlende uGUI-Registrierung und einen verspäteten Ziel-Fallback auf; diese werden im Runtime-Code und mit expliziten Regressionen korrigiert.
- Späterer Feinschliff: lange Forschungstitel und aktive Lernkarten auf allen Breiten weiter beurteilen; keine neue Rahmen-/Effektbibliothek. Im Rahmen dieser Reparatur nur bedienungsrelevante Korrekturen.
- Gemessene Ursachen weiter eingegrenzt: dynamische Kartenhöhe muss den Inhalt statt der intrinsischen Höhe des Rahmensprites verwenden. Längere Namen/Effekte werden in echten Game-View-Größen geprüft. Fingerposition nach Canvaslayout ohne eigenes ForceUpdateCanvases pro Frame. Gemessene Layoutzeiten und native Belege stehen im Prüfbericht.
- Separater funktionaler Altbefund beim TS-Abgleich: `TapSurface` besitzt einen Halte-Repeater (3/s), die aktuelle Unity-Tapfläche konsumiert einzelne Klicks. In dieser UI-Reparatur keine neue Eingabemechanik eingeführt; Mira verspricht das nicht verfügbare Halten nicht mehr. Vollständige Migrationsparität deshalb nicht pauschal behaupten.

- Offen und getrennt von erledigten Layoutreparaturen: physische iPhone-/Android-Lesbarkeit, Softwaretastatur mit tatsächlichem Insetswechsel, reale Fingerbedienung und Energie-/Wärmeprüfung. Device-Hub-Tasten und Buttonclicks ersetzen diese nicht.
- Performance hat Vorrang vor weiterer allgemeiner Designrunde: stationär im optimierten Simulator etwa 16,67 ms, aber bis etwa 50 ms bei Käufen. Weitere Pending-Decode-/Validierungs- und Kauf-Layoutarbeit messen, Transaktionssicherheit nicht abschwächen.
- Keine Behauptung, die aktuelle Oberfläche sei bereits der abschließende Pixel-Art-/Animationsfeinschliff. Bestehende Originalassets und gemeinsame Komponenten bilden die Grundlage.

## Truhen und Komponenten · 23.10.2026

- Gezielte Deckelverschiebung ersetzt: feste perspektivische Scharnierachse, eigene Innenflächen, eingefasste offene Mulde und erst danach tatsächliche gespeicherte Funde. Die Truhe bleibt offen sichtbar. [Echte Clips und Layoutprüfung](unity-chest-components.md).
- Alle 20 Komponenten gemeinsam klein im Inventar und Materialtab, Bestand und antippbare Details/Synthese. Fehlerhafte Erweiterungsatlas-Ausschnitte korrigiert; kein weiterer Grafikstil hinzugefügt.
- Eigene visuelle Sichtprüfung umfasst 320/390/430 px und DE/EN; reale Geräte-/Touch-/Lautsprecherabnahme bleibt separat. Historische Sprachfallbacks im Markt und allgemeine Shopdichte bleiben offen. Keine neue allgemeine Effekt-/Designrunde begonnen.

## Meta-Visual-/Itemrunde · 23.10.2026

Eigene Progressionsmotive ersetzen jetzt sämtliche falschen Item-/Hardwarezuordnungen in60INT-/24Axiomknoten. Netzwerkhöhe/Toolbar und identische88er-Sockel sind tatsächlich im Spiel geprüft. Sechs neue Itemgrafiken und sechs Mira-Ausdrücke verwenden gemeinsame Darstellung, ohne zusätzliche überlagerte Rahmen. Vier echte Truhenaufnahmen einschließlich Legendary-Ergebnis und tatsächlichem Audio liegen im Abschnittsbericht.

Weiter getrennt offen: sehr dichte Knotentexte bei kleinster Zoomstufe benötigen gezieltes Zoomen/Details; historische Sprachfallbacks in Knoten-/Shop-/Companytexten; tatsächliche Company-Projekt-/Online-Meilensteininszenierung erst mit verifiziertem Anbieter und bestätigten Serverereignissen; weitere Shop-/Menüverdichtung und physische Lautsprecher-/Touchabnahme. Keine nicht ausgelösten Onlineeffekte als Videoerfolg behaupten.

## Truhen/Gumball und kompakte Mira-Box · 25.10.2026

Die positive Scharnierbeurteilung vom23.10 ist durch erneute Nutzerabnahme überholt: horizontal geteilter Deckel, künstliche Mulde und Innenplatte wirkten trotz bestandener Tests perspektivisch falsch. Ersatz durch zusammenhängende gezeichnete Öffnungsposen; verzerrender Mesh-Renderer entfernt. Beim Gumball-Automaten zusätzlich tatsächlichen unsichtbaren-Kapsel-Zustand nach Truhenfolge und fehlerhaften Hälftenzuschnitt korrigiert. Gemeinsame kompakte Mira-Box statt abweichender bildschirmhoher Story-Dialogdarstellung. Aktueller Nachweis: [Truhen/Gumball/Mira](unity-reward-motion-v2.md).

Weiter offen: abschließende subjektive Bewegungsabnahme auf dem tatsächlich aktualisierten Simulator/physischem Gerät; Lautsprecher-/Touchprüfung, Tastatur-Inset bei Namenswahl, weitere Marktverdichtung und historische Sprachfallbacks außerhalb dieses Abschnitts. Die gezeichneten Deckelposen und zeitkontinuierlichen Kapsel-/Beutebewegungen sind getrennte Techniken; kein Anspruch auf physikalische3D-Truhensimulation. Keine pauschale Qualitätsfreigabe aus Testergebnissen.

- Native Mira-Namenswahl/Dialog auf iPhone16Pro-Simulator mit sicherer Insel-/Navigationsfläche tatsächlich angesehen; normaler Spielerstand danach wieder geöffnet. Physischer Finger/Softwaretastatur/Lautsprecher bleibt offen. Vereinzelte bereits vorhandene Randfragmente in Material-Atlasmotiven (z.B. Keramikkondensator) getrennt bei der nächsten gezielten Assetbereinigung beurteilen; keine Zuordnungs-/Balanceänderung in dieser Animationskorrektur.

## INT-/Axiomnetz · 25.10.2026

- [x] Gemeinsame Stahl-/Schrift-/Goldgestaltung und eigene Progressionsicons, ruhige Bereichs-/Werkzeugleisten.
- [x] Inhaltsabhängige Knotendetails, Einzeilennamen mit vollständigem Detailtitel, Geld-/Kaufzustände und dynamische Netzhöhe.
- [x] Tatsächliche DE/EN-Ansichten bei320/390/430px selbst geprüft; [Nachweise](unity-prestige-skin.md).
- [ ] Historische gemischtsprachige Netzbeschriftungen und Katalogbeschreibungen vollständig lokalisieren.
- [ ] Reale Zwei-Finger-/Safe-Area-/Lesbarkeitsabnahme auf physischem iPhone; kein neuer Simulatorbuild für diesen Abschnitt.

## Navigation, Schmiede und Forschung · 26.10.2026

- [x] Vier/fünf Hauptreiter mit echtem Fortschrittszugang, Modell → Training und Shop ganz rechts.
- [x] Inventar, Komponenten, Baupläne, Herstellen, Fusion als eigene Schmiedereiter; saubere kosmetische Ergebniswechsel.
- [x] Kompakte Forschungsbereiche, Details auf Antippen, reale belegte/freie Labore und Restzeit; erhaltene bezahlte Aufträge nach Kapazitätsverlust sichtbar.
- [x] DE/EN320/390/430px und echte Schmiedeaufnahme geprüft; [Nachweis](unity-navigation-forge.md).
- [ ] Ältere gemischtsprachige Material-/Analyse-/Detailtexte vollständig lokalisieren.
- [ ] Shop-Unterseiten optisch separat verdichten; diese Änderung bündelt ihre vorhandenen Zugänge.
- [ ] Physische Geräte-/Touch-/Lautsprecher-/Safe-Area-/Performanceabnahme.

- [x] Lange Ressourcenwerte und Modellproduktion anhand des tatsächlichen fortgeschrittenen Simulatorstands korrigiert; vollständige Glyphen und Begrenzungen bei DE/EN320/390/430 getestet.

## Drohnenlieferung · 26.10.2026

- [x] Originalpaket sichtbar an der Drohne, Countdown getrennt und kontrastiert; bewegtes96×106-Touchziel ohne dekorative Raycastblocker.
- [x] Gespeicherte tatsächliche Fundanzeige einschließlich erster Itembelohnung vor Schmiedebesuch, Paketfall/Abflug und örtlicher Siegelauflösung; voller Core-Fund bei320px lesbar.
- [x] DE/EN320/390/430, echter Clip mit Unity-Audio, Abbruch/Reload/reduzierte Bewegung geprüft; [Nachweise](unity-drone-delivery.md).
- [ ] Zusätzliche gezeichnete Offenpose des Pakets optional für spätere Detailanimation; aktuelle Sequenz löst das Siegel auf und enthüllt den Inhalt.
- [ ] Physischer iPhone-Touch/Lautsprecher und60fps getrennt abnehmen.

## Ruhige Hauptansichten und Ausrüstung · 26.10.2026

- [x] Testsave-Fußzeile aus der Spieloberfläche entfernt; Diagnoseflag, Challenge-/Speicherwarnungen und Autosave erhalten.
- [x] Trainingsbutton kompakt/goldgelb, tatsächliche Modellzeile ohne Überlauf; Forschungsthema und20er-Kostenicon getrennt.
- [x] Sechs Sockel in zwei symmetrischen Dreierreihen, gleiche sichtbare Meshmaße aller Formen; kompakte Produktions-/Detailzeile. Universalsockel erst nach jeweiligem echten Zugang.
- [x] Leere/belegte Ansichten DE/EN320/390/430 und automatisches Speichern/Modellwechsel geprüft. [Nachweise](unity-clean-ui.md).
- [ ] Unterreiter in Schmiede/Forschung/Shop einheitlich verdichten; aktuelle zweizeilige Navigation benötigt relativ viel Höhe.
- [ ] Labor-/Trainingsrestzeiten über gemeinsame kompakte Zustandsanzeigen angleichen.
- [ ] Ältere Shop-/Analyse-/Detailkosten an die kleinen geprüften Kostenicons angleichen.
- [ ] Physische Geräte-, Textgrößen-/Touch- und60fps-Abnahme separat.

- [x] Im nativen Labor aufgedeckter Mira-Überlauf nach Reload reproduziert und an der nachträglichen Textmessung behoben; Seite vollständig lesbar, Storyzustand unverändert. Finale Gesamtprüfung im aktuellen Bericht.
- [ ] Bestehende deutsche Funktionskopie `prestige-ready` in `src/story.ts` vollständig lokalisieren; unveränderten Quellfallback von UI-Layoutfehlern unterscheiden.
