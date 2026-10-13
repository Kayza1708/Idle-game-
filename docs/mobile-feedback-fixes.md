# Korrekturen nach Mobile-Feedback

Basis: main 882c5f2 einschließlich #101. Ausschließlich Darstellung und Bedienung: keine Änderung an Economy, Inventartransaktionen, Save, Balancing, Shopangeboten oder Freischaltregeln.

## Änderungen

- Tutorial: Portal in document.body statt im isolierten Appcontainer. Zentrierung über linke/rechte Begrenzung und automatische Ränder, ohne translate/transform; ausreichend Höhe, scrollbarer Inhalt und 44px-Buttons. Für offene Detailblätter wechselt die Hilfe an den oberen Rand und das Blatt bekommt Platz darunter. Während Menü/Profil/Equipment ist sie ausgeblendet, damit sie deren Aktionen nicht verdeckt. Guide, Zielnavigation und Skip bleiben unverändert.
- Hardware: Kaufbutton nur Preis plus kleines Creditsicon, nebeneinander und ohne x/y oder zweites KAUFEN-Label. disabled wird weiterhin aus derselben hardwarePurchasePreview.allowed abgeleitet.
- Action: vorhandene early-lab-pixel-art.png als gedimmter, dekorativer Laborhintergrund statt aktueller Hardwareabbildung. Kein neuer Hardware-/Itemgrant, kein anderer Tap-/Overclock-/Dropablauf. Kein neues Rasterasset erforderlich.
- Komponenteninventar: vier Spalten, Bild plus Menge, keine Einzelkartenrahmen und keine Reservierungszeile. Vollständiger Materialname im zugänglichen Buttonnamen und nach Tap im Detailfenster. Alle 20 Typen bleiben sichtbar, auch bei Menge null. Buchungen/Reservierungen unverändert.
- Zutaten: Bedarf null aus Material-/Modulrezepten und Forgekosten herausgefiltert; RecipeIngredient schützt zusätzlich vor Einzelrender mit Bedarf null. Positive/ungültige Einzelquoten werden nicht zu kostenlosen Kosten umgedeutet.
- Menü: kompakte Liste statt zweispaltiger Karten. Settings: kontrollierte Label-/Feldspalten, vollständige Feldbreiten, feste Slider-/Outputspalte; kleine Toggles in 48px-Labelzeilen. Diagnosebuttons als Liste.
- Shop: drei Kategorien (Dauerhaft/Boosts/Materialien), Angebotstitel und kurze Wirkung neben einem kompakten Gem-Preis. Angebotsinfo ist auch bei fehlenden Gems antippbar. Gemeinsames Bottom Sheet zeigt volle Wirkung, Zeitwirkung, Quote/Blockgrund und Bestätigung. Kauf bleibt gesperrt, solange dieselbe gemOfferQuote nicht enabled ist. Challenge-/Materialzugänge bleiben erhalten.

## Prüfung

1.361 Tests in 98 Dateien bestanden, einschließlich fünf neuer konkreter UI-Regressionsverträge. Typecheck/Source-Path-Check, Build und Diffcheck grün. Hardwareaffordability-Test nutzt ausdrücklich einen vorbereiteten Null-Credit-Ledger, nicht eine Annahme über Startressourcen. Shoptest vergleicht die tatsächlichen Start-Gems vor/nach Rendering. Der alte Test gegen die Laborillustration wurde an die ausdrücklich gewünschte Verwendung angepasst. Bestehende Bundlewarnung bleibt.

Keine Browser-/iOS-Sichtabnahme behauptet: Screenshotpfade fehlen; lokale Browserbereitstellung war in der vorherigen Prüfung blockiert. Portal-/CSSänderungen und Renderverträge sind kein Nachweis tatsächlicher Pixelposition. Noch zu prüfen: Tutorial in 360×640/390×844/430×844 und mit offenem Trainingsblatt, Close/Show/Skip, Avatar/Text und Tastatur; Menü/Settings/Audio, Preise mit großen Zahlen, alle Shopkategorien und gesperrte Angebotsdetails, Komponentenlink und positive Rezeptkosten. Materialnamen erscheinen bewusst erst auf Tap, um die Sammlungsansicht schlicht zu halten.

Nach Merge neu bauen und synchronisieren: git pull --ff-only && npm run build && npx cap sync ios && npx cap open ios. Kein automatischer Merge oder Release.
