# Native Gem-Pakete – Integrationsvertrag

Der aktuelle Stand ist ausschließlich eine Browser-/Vite-App. Es gibt weder iOS-/Android-Hülle, Store-SDK, authentifizierte Nutzeridentität noch verifizierenden Server. Deshalb exportiert `src/gemShop.ts` nur stabile Produkt-IDs und Gemmengen. Die Browser-UI zeigt keine Preise und besitzt keinen aktiven Echtgeld-Kaufpfad. Insbesondere darf kein Store-Callback direkt `GameState.gems` verändern.

## Produkte

- `ai_singularity_gems_120` – 120 Gems
- `ai_singularity_gems_650` – 650 Gems
- `ai_singularity_gems_1400` – 1.400 Gems

Preis und Währung müssen ausschließlich aus den lokalisierten Apple-/Google-Produktdaten stammen.

## Vor einem Release erforderlich

1. Native iOS-/Android-Hülle und aktuelle offizielle StoreKit-/Google-Play-Billing-Anbindung einführen.
2. Konto-/Geräteidentität mit sicherer Anmeldung und serverseitigem Gem-Kontostand bereitstellen.
3. Storeprodukte in App Store Connect und Play Console anlegen und Sandbox-/Lizenztester konfigurieren.
4. Kaufbeleg an ein authentifiziertes Backend senden; dort Apple-/Google-Status und Produkt-ID prüfen.
5. Transaktions-ID serverseitig eindeutig speichern, Gems genau einmal gutschreiben und erst danach konsumierbare Käufe bestätigen/verbrauchen.
6. Abbruch, Pending, erneute Callbacks, Erstattung und Widerruf explizit verarbeiten. Bei Pending niemals vorab Gems vergeben.
7. Serverkonto und lokalen Spielstand konfliktfest synchronisieren; `localStorage` ist weder Kaufbeleg noch geräteübergreifender Kontostand.
8. Sandbox-Tests für Erfolg, Abbruch, Pending, Duplikat, Erstattung, Netzwerkabbruch und Wiederanmeldung auf beiden Plattformen durchführen.

Es existiert absichtlich kein regulärer Dev-Schalter, der Echtgeld-Gems simuliert. Ein späterer isolierter Testadapter muss aus Produktions-Builds entfernt sein und Testguthaben eindeutig von normalen Saves trennen.
