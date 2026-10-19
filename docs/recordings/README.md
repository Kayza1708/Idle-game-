# Unity-Schmiedeaufnahme

`unity-forge.mp4` zeigt die echte Szene `IdleIntelligence/Assets/Scenes/IdleIntelligence.unity` im Editor 6000.3.26f1: Komponentenflug, Amboss/Partikel, drei ausgewählte Impulsrelais, Fusion zum tatsächlichen ungewöhnlichen Exemplar mit grünem Rahmen. Kein UI-Mockup.

Quelle: PlayMode-Test `WorkshopTests.RecordActualCraftAndFusionAtMobileSizes`; 92 PNG-Frames des gerenderten Canvas/der Kamera bei 390 × 844, jeweils mit 0,05 s Mindestabstand aufgenommen und als kurzer H.264-Clip mit 20 fps codiert. Die Abtastung ist kein Messnachweis exakter Animationsdauer oder Gerätebildrate. Der Test bereitet ausschließlich in seinem temporären Spielstand Komponenten, Baupläne und Daten vor; der normale Spielstart enthält diese Vorräte nicht. Animationen vergeben keine Ressourcen oder Items.

Erneut erzeugen: Unity-Projekteditor vollständig schließen, dann den PlayMode-Test über Test Runner oder Batch mit `-runTests -testPlatform PlayMode -testFilter IdleIntelligence.PlayTests.WorkshopTests.RecordActualCraftAndFusionAtMobileSizes` starten. Frames landen unter `/tmp/unity-forge-frames/`, mobile Vergleichsbilder unter `/tmp/unity-forge-*.png`. Der Mitschnitt ersetzt keine echte iPhone-/Android-Abnahme.
