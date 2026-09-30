# Mira, Prolog und Tutorial

Neue Kampagnen beginnen mit vier kurzen Prologdialogen. Danach wartet das Tutorial jeweils auf eine echte Spielhandlung: Laborimpuls, Hardwarekauf, Trainingsabschluss und – sobald verfügbar – Forschung oder Experiment. Bereits erfüllte Schritte werden anhand des aktuellen Spielstands übersprungen; Betriebsprofile sind keine Pflichtentscheidung.

Erste Hardware, erstes Training, erste Forschung beziehungsweise erster Durchbruch, erster Hardware-Meilenstein, erreichbarer INT und erster Prestige lösen je einen gespeicherten Dialog aus. Gleichzeitige Ereignisse werden in einer einzigen Warteschlange geordnet. Das Journal unter **Missionen** enthält ausschließlich Dialoge, die der jeweilige Spielstand tatsächlich bereits gesehen hat.

Save v9 speichert offenen Dialog, Warteschlange, Tutorialziel und gesehene Einträge. Migrierte Spielstände aus v1–v8 beginnen nicht nachträglich im Prolog. Dialoge verändern oder pausieren die Simulation nicht.

Die UI erwartet Miras unverändertes transparentes Originalbild unter `public/assets/game/mira-voss.png`. Diese Datei fehlte im bereitgestellten Repository-Stand und darf nicht durch eine Ersatzgrafik erfunden werden.

## AURA-Fortschrittskapitel

Fünf zweitseitige Mira-Kapitel begleiten nun echte Zustandswechsel: erstes abgeschlossenes Quality-Training, erstmals 1.000 gleichzeitige Nutzer, erster Prestige, erstes tatsächlich ausgerüstetes Item und erster Kauf eines Server-Racks. Bei mehreren Treffern gilt diese feste Reihenfolge; Tutorialdialoge bleiben davor in derselben Warteschlange.

Bereits fortgeschrittene Spielstände schalten passende Kapitel beim ersten Laden nur im Journal frei. Die automatische Story-Anzeige lässt sich unabhängig vom Tutorial deaktivieren; erreichte Kapitel bleiben lesbar und erneutes Lesen verändert weder Fortschritt noch Belohnungen. Die Texte stehen auf Deutsch und Englisch bereit und setzen den gespeicherten KI-Namen als React-Text ein.
