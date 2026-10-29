# Neue Itemmotive – Grafikvorbereitung

Sechs eigenständige Rastermotive wurden mit dem eingebauten `image_gen` erzeugt. Die vollständigen Prompts und Originalpfade stehen in [manifest.json](manifest.json). Keine fremden Grafikpakete, bestehenden Itembilder oder Seltenheitsrahmen wurden ersetzt. Die PNG-Originale bleiben unverändert und besitzen Alpha.

Alle sechs Motive wurden angesehen: klare einzelne Silhouetten, gemeinsame Stahl-/Elfenbeinmaterialien und unterscheidbare Funktion/Farbakzente. Der Flottenkoordinator ist höher als die anderen Geräte; seine tatsächliche Größe im gemeinsamen Sockel muss bei der Einbindung geprüft werden. Kleine Details und Konturen bei 320 px sind noch nicht abgenommen. Diese Bilder sind Assets, **kein Unity-Implementierungsnachweis**.

Die sechs Motive sind inzwischen über die verbundene Editor-API als unabhängige Sprites importiert: `Assets/IdleIntelligence/Art/ItemV3/`, Point-Filter, keine Mipmaps, unkomprimiert, zentraler Pivot. `ISpriteFrameEditCapability/EditPivot` wurde für jeden Import geprüft; keine `.meta` handbearbeitet. GUIDs und Einstellungen: [unity-import.json](unity-import.json); reproduzierbarer Statementblock: `scripts/unity-import-v3-art.eval.cs`.

Die offizielle Pipeline `0.9.1-exp.1` ist installiert. `eval`, Assetkatalog/Project-Auswahl, Console und echtes isoliertes Play sind nachgewiesen. [Live-Nachweis](live-editor-proof.json) einschließlich fortlaufender Frames und unveränderter Game-View-Aufnahme; keine normale Savedatei benutzt. Ein erster CLI-Start beendete sich nach „ready“; der wartende CLI-Prozess hält die eigene Instanz zuverlässig am Leben. Ein abgewiesener Versuch mit gemeinsamem `--wait --until-ready` wurde auf `--wait` plus separate Bereitschaftsprüfung korrigiert. Keine Logs an Unity gesendet.

Noch offen: erreichbare Rezepte, vollständige Verbraucher, Alpha-Bounds in den gemeinsamen Itemporträts, Katalog-/Sockeleinbindung und tatsächliche Ansichten der neuen Items. Die Pipelineaufnahme zeigt den unveränderten frischen Start, **nicht** fertig implementierte V3-Items.

Herkunft: eigens für diesen Auftrag KI-generierte Grafiken; keine zusätzliche Drittanbieter-Assetlizenz eingebunden. Vor Veröffentlichung gelten weiterhin die gesonderte Inhalts-/Rechteprüfung und Geräteabnahme.
