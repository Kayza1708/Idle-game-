import type {Language} from './i18n';
import type {
  BreakthroughId,
  ComponentId,
  ExperimentId,
  ItemEffect,
  ItemTypeId,
  PrestigeUpgradeId,
  Rarity,
  RepeatableResearchId,
  ResearchProjectId,
} from './economy';

type L=Record<Language,string>;
const l=(en:string,de:string,es:string,fr:string,pt:string,it:string,pl:string):L=>({en,de,es,fr,pt,it,pl});
const pick=(x:L,language:Language)=>x[language]??x.en;

/* =========================================================
   GENERAL UI
   ========================================================= */

const ui={
 researchLab:l('Research Lab','Forschungslabor','Laboratorio de investigación','Laboratoire de recherche','Laboratório de pesquisa','Laboratorio di ricerca','Laboratorium badawcze'),
 discoverSbc:l('Discover the single-board computer first.','Entdecke zuerst den Einplatinencomputer.','Descubre primero el ordenador de placa única.','Découvrez d’abord l’ordinateur monocarte.','Descubra primeiro o computador de placa única.','Scopri prima il computer a scheda singola.','Najpierw odkryj komputer jednopłytkowy.'),
 data:l('Data','Daten','Datos','Données','Dados','Dati','Dane'),
 research:l('Research','Forschung','Investigación','Recherche','Pesquisa','Ricerca','Badania'),
 lab:l('Lab','Labor','Laboratorio','Laboratoire','Laboratório','Laboratorio','Laboratorium'),
 level:l('Level','Stufe','Nivel','Niveau','Nível','Livello','Poziom'),
 unlockParallel:l('Unlock via Parallel Lab in the prestige tree.','Mit Parallel-Labor im Prestige-Baum freischalten.','Desbloquea mediante Laboratorio paralelo en el árbol de prestigio.','Débloquez via Laboratoire parallèle dans l’arbre de prestige.','Desbloqueie via Laboratório paralelo na árvore de prestígio.','Sblocca tramite Laboratorio parallelo nell’albero prestigio.','Odblokuj przez Laboratorium równoległe w drzewku prestiżu.'),
 unlockGem:l('Unlock permanently in the Gem Shop.','Dauerhaft im Gem-Shop freischalten.','Desbloquea permanentemente en la tienda de gemas.','Débloquez définitivement dans la boutique de gemmes.','Desbloqueie permanentemente na loja de gemas.','Sblocca permanentemente nel negozio gemme.','Odblokuj na stałe w sklepie z klejnotami.'),
 readyProject:l('Ready for a project.','Bereit für ein Projekt.','Listo para un proyecto.','Prêt pour un projet.','Pronto para um projeto.','Pronto per un progetto.','Gotowe na projekt.'),
 remaining:l('remaining','noch','restante','restant','restante','rimanenti','pozostało'),
 stored:l('stored','fest gespeichert','guardado','enregistré','guardado','memorizzato','zapisano'),
 repeatable:l('Repeatable Research','Wiederholbare Forschung','Investigación repetible','Recherche répétable','Pesquisa repetível','Ricerca ripetibile','Badania powtarzalne'),
 requirement:l('Requirement','Voraussetzung','Requisito','Prérequis','Requisito','Requisito','Wymaganie'),
 current:l('Current','Aktuell','Actual','Actuel','Atual','Attuale','Obecnie'),
 nextLevel:l('next level','nächste Stufe','siguiente nivel','niveau suivant','próximo nível','livello successivo','następny poziom'),
 missing:l('missing','fehlen','faltan','manquants','em falta','mancanti','brakuje'),
 savingTime:l('saving time','Ansparzeit','tiempo de ahorro','temps d’accumulation','tempo de acumulação','tempo di accumulo','czas gromadzenia'),
 fixedDuration:l('fixed duration','feste Dauer','duración fija','durée fixe','duração fixa','durata fissa','stały czas'),
 running:l('Running','Läuft','En curso','En cours','Em andamento','In corso','W toku'),
 start:l('Start','Starten','Iniciar','Démarrer','Iniciar','Avvia','Uruchom'),
 queued:l('Queued','Vorgemerkt','En cola','En file','Na fila','In coda','W kolejce'),
 queue:l('Queue','Vormerken','Añadir a cola','Ajouter à la file','Adicionar à fila','Metti in coda','Dodaj do kolejki'),
 oneTime:l('One-time Breakthroughs','Einmalige Durchbrüche','Avances únicos','Percées uniques','Avanços únicos','Scoperte uniche','Jednorazowe przełomy'),
 completedOnce:l('Completed · one-time','Abgeschlossen · einmalig','Completado · único','Terminé · unique','Concluído · único','Completato · unico','Ukończono · jednorazowo'),
 startProject:l('Start project','Projekt starten','Iniciar proyecto','Démarrer le projet','Iniciar projeto','Avvia progetto','Uruchom projekt'),

 componentAnalysis:l('Component Analysis','Komponentenanalyse','Análisis de componentes','Analyse de composants','Análise de componentes','Analisi componenti','Analiza komponentów'),
 lastFind:l('Last find','Letzter Fund','Último hallazgo','Dernière découverte','Último achado','Ultimo ritrovamento','Ostatnie znalezisko'),
 components:l('components','Komponenten','componentes','composants','componentes','componenti','komponenty'),
 analysisOccupied:l('Analysis slot occupied','Analyseslot belegt','Ranura de análisis ocupada','Slot d’analyse occupé','Espaço de análise ocupado','Slot di analisi occupato','Slot analizy zajęty'),
 short:l('Short','Kurz','Corto','Court','Curta','Breve','Krótka'),
 long:l('Long','Lang','Largo','Long','Longa','Lunga','Długa'),
 reserved:l('reserved','reserviert','reservado','réservé','reservado','riservato','zarezerwowano'),
 cancelAnalysis:l('Cancel analysis · no refund','Analyse abbrechen · keine Erstattung','Cancelar análisis · sin reembolso','Annuler l’analyse · aucun remboursement','Cancelar análise · sem reembolso','Annulla analisi · nessun rimborso','Anuluj analizę · bez zwrotu'),
 dropTable:l('Drop table per component find','Drop-Tabelle pro Komponentenfund','Tabla de botín por componente','Table de butin par composant','Tabela de drops por componente','Tabella drop per componente','Tabela dropu na komponent'),
 baseWeight:l('base weight','Basisgewicht','peso base','poids de base','peso base','peso base','waga bazowa'),
 findBonus:l('find bonus','Fundbonus','bonificación de hallazgo','bonus de découverte','bônus de descoberta','bonus ritrovamento','bonus znaleziska'),
 required:l('required','benötigt','requerido','requis','necessário','richiesto','wymagane'),
 available:l('available','vorhanden','disponible','disponible','disponível','disponibile','dostępne'),
 shortage:l('shortage','Fehlmenge','faltante','manquant','em falta','mancanza','niedobór'),
 cannotStart:l('Cannot start','Nicht startbar','No se puede iniciar','Impossible de démarrer','Não é possível iniciar','Impossibile avviare','Nie można uruchomić'),
 breakthroughs:l('Breakthroughs','Durchbrüche','Avances','Percées','Avanços','Scoperte','Przełomy'),
 researched:l('Researched','Erforscht','Investigado','Recherché','Pesquisado','Ricercato','Zbadano'),
 fragments:l('Frag.','Frag.','Frag.','Frag.','Frag.','Framm.','Frag.'),

 signalDrops:l('Signal Drops','Signal-Drops','Drops de señal','Drops de signal','Drops de sinal','Drop di segnale','Dropy sygnału'),
 equipment:l('Equipment','Ausrüstung','Equipo','Équipement','Equipamento','Equipaggiamento','Wyposażenie'),
 slots:l('slots','Sockel','ranuras','emplacements','espaços','slot','sloty'),
 itemEffects:l('Item effects','Itemeffekte','Efectos de objetos','Effets des objets','Efeitos dos itens','Effetti oggetti','Efekty przedmiotów'),
 componentInventory:l('Component Inventory','Komponentenbestand','Inventario de componentes','Stock de composants','Inventário de componentes','Inventario componenti','Magazyn komponentów'),
 source:l('Source','Quelle','Fuente','Source','Fonte','Fonte','Źródło'),
 blueprintFragments:l('blueprint fragments','Bauplanfragmente','fragmentos de plano','fragments de plan','fragmentos de projeto','frammenti progetto','fragmenty schematu'),
 base:l('Base','Basis','Base','Base','Base','Base','Baza'),
 scales:l('scales with hardware classes, milestones and rarity','skaliert mit Hardwareklassen, Meilensteinen und Seltenheit','escala con clases de hardware, hitos y rareza','évolue avec les classes matérielles, jalons et rareté','escala com classes de hardware, marcos e raridade','scala con classi hardware, traguardi e rarità','skaluje się z klasami sprzętu, kamieniami milowymi i rzadkością'),
 equipped:l('EQUIPPED','AUSGERÜSTET','EQUIPADO','ÉQUIPÉ','EQUIPADO','EQUIPAGGIATO','ZAŁOŻONO'),
 inventory:l('inventory','Bestand','inventario','stock','inventário','inventario','stan'),
 upgrade:l('Upgrade','Upgrade','Mejora','Amélioration','Melhoria','Potenziamento','Ulepszenie'),
 maxLevel:l('Mythic · maximum level','Mythisch · maximale Stufe','Mítico · nivel máximo','Mythique · niveau maximal','Mítico · nível máximo','Mitico · livello massimo','Mityczny · maksymalny poziom'),
 afterPrestige:l('After 1 prestige','Nach 1. Prestige','Tras 1 prestigio','Après 1 prestige','Após 1 prestígio','Dopo 1 prestigio','Po 1 prestiżu'),
 equip:l('Equip','Ausrüsten','Equipar','Équiper','Equipar','Equipaggia','Załóż'),
 improveRarity:l('Improve rarity','Rarität verbessern','Mejorar rareza','Améliorer la rareté','Melhorar raridade','Migliora rarità','Ulepsz rzadkość'),
 forge:l('Forge','Schmiede','Forja','Forge','Forja','Forgia','Kuźnia'),
 fuse:l('Fuse 3×','3× fusionieren','Fusionar 3×','Fusionner 3×','Fundir 3×','Fondi 3×','Połącz 3×'),
 unlock:l('Unlock','Entsperren','Desbloquear','Déverrouiller','Desbloquear','Sblocca','Odblokuj'),
 lock:l('Lock','Sperren','Bloquear','Verrouiller','Bloquear','Blocca','Zablokuj'),
 salvage:l('Salvage','Zerlegen','Desmontar','Recycler','Desmontar','Smantella','Rozmontuj'),
 modules:l('Modules','Module','Módulos','Modules','Módulos','Moduli','Moduły'),
 cost:l('Cost','Kosten','Coste','Coût','Custo','Costo','Koszt'),
 craftModule:l('Craft module','Modul herstellen','Fabricar módulo','Fabriquer le module','Fabricar módulo','Produci modulo','Wytwórz moduł'),
 blueprints:l('Blueprints','Baupläne','Planos','Plans','Projetos','Progetti','Schematy'),
 result:l('Result','Ergebnis','Resultado','Résultat','Resultado','Risultato','Wynik'),
 modulesMissing:l('Modules missing','Module fehlen','Faltan módulos','Modules manquants','Faltam módulos','Moduli mancanti','Brak modułów'),
 craftPermanent:l('Craft permanently','Dauerhaft herstellen','Fabricar permanentemente','Fabriquer définitivement','Fabricar permanentemente','Produci permanentemente','Wytwórz na stałe'),

 singularity:l('Singularity · INT','Singularität · INT','Singularidad · INT','Singularité · INT','Singularidade · INT','Singolarità · INT','Osobliwość · INT'),
 prestigeNow:l('Prestige now','Bei sofortigem Prestige','Prestigio ahora','Prestige maintenant','Prestígio agora','Prestigio ora','Prestiż teraz'),
 permanentFactor:l('Permanent credit factor','Dauerhafter Creditfaktor','Factor permanente de créditos','Facteur permanent de crédits','Fator permanente de créditos','Fattore crediti permanente','Stały mnożnik kredytów'),
 afterwards:l('afterwards','danach','después','ensuite','depois','dopo','potem'),
 lost:l('Lost','Geht verloren','Se pierde','Perdu','Perdido','Si perde','Utracone'),
 kept:l('Kept','Bleibt','Se conserva','Conservé','Mantido','Rimane','Pozostaje'),
 noInt:l('No INT available yet','Noch keine INT verfügbar','Aún no hay INT disponible','Aucun INT disponible','Nenhum INT disponível ainda','Nessun INT disponibile','Brak dostępnego INT'),
 claim:l('claim','beanspruchen','reclamar','réclamer','resgatar','riscatta','odbierz'),
 circuit:l('INT Circuit Board','INT-Leiterplatte','Placa de circuitos INT','Circuit INT','Placa de circuito INT','Circuito INT','Płytka INT'),
 effect:l('Effect','Effekt','Efecto','Effet','Efeito','Effetto','Efekt'),
 formula:l('Formula','Formel','Fórmula','Formule','Fórmula','Formula','Wzór'),
 currentValue:l('Current value','Aktueller Wert','Valor actual','Valeur actuelle','Valor atual','Valore attuale','Aktualna wartość'),
 nextNode:l('Next node','Nächster Knoten','Siguiente nodo','Nœud suivant','Próximo nó','Nodo successivo','Następny węzeł'),
 branchComplete:l('Branch complete','Ast vollständig','Rama completa','Branche terminée','Ramo concluído','Ramo completo','Gałąź ukończona'),
 example:l('Example before/after','Beispiel vorher/nachher','Ejemplo antes/después','Exemple avant/après','Exemplo antes/depois','Esempio prima/dopo','Przykład przed/po'),
 alreadyPurchased:l('Already purchased','Bereits gekauft','Ya comprado','Déjà acheté','Já comprado','Già acquistato','Już kupiono'),
 requirementMissing:l('Requirement missing','Voraussetzung fehlt','Falta requisito','Prérequis manquant','Requisito ausente','Requisito mancante','Brak wymagania'),
 needed:l('needed','benötigt','necesario','requis','necessário','necessario','wymagane'),
 buy:l('Buy','Kaufen','Comprar','Acheter','Comprar','Acquista','Kup'),
 total:l('total','gesamt','total','total','total','totale','łącznie'),
 spent:l('spent','ausgegeben','gastado','dépensé','gasto','spesi','wydano'),
 purchased:l('purchased','gekauft','comprado','acheté','comprado','acquistato','kupiono'),
 purchasable:l('purchasable','kaufbar','comprable','achetable','comprável','acquistabile','do kupienia'),
 locked:l('locked','gesperrt','bloqueado','verrouillé','bloqueado','bloccato','zablokowane'),
 close:l('Close','Schließen','Cerrar','Fermer','Fechar','Chiudi','Zamknij'),
} as const;

export type GameplayUiKey=keyof typeof ui;
export const g=(language:Language,key:GameplayUiKey)=>pick(ui[key],language);

/* =========================================================
   RESEARCH
   ========================================================= */

type ResearchCopy={name:L;category?:L;effect:L};

const rc=(name:L,category:L,effect:L):ResearchCopy=>({name,category,effect});

const research:Record<RepeatableResearchId,ResearchCopy>={
 dataGeneration:rc(
  l('Data Generation','Datenerzeugung','Generación de datos','Génération de données','Geração de dados','Generazione dati','Generowanie danych'),
  l('Infrastructure','Infrastruktur','Infraestructura','Infrastructure','Infraestrutura','Infrastruttura','Infrastruktura'),
  l('More data from existing users.','Mehr Daten aus bestehenden Nutzern.','Más datos de usuarios existentes.','Plus de données des utilisateurs existants.','Mais dados de usuários existentes.','Più dati dagli utenti esistenti.','Więcej danych od istniejących użytkowników.')
 ),
 materialAnalysis:rc(
  l('Material Analysis','Materialanalyse','Análisis de materiales','Analyse des matériaux','Análise de materiais','Analisi materiali','Analiza materiałów'),
  l('Analysis','Analyse','Análisis','Analyse','Análise','Analisi','Analiza'),
  l('More guaranteed components from analyses.','Mehr garantierte Komponenten aus Analysen.','Más componentes garantizados de los análisis.','Plus de composants garantis par les analyses.','Mais componentes garantidos nas análises.','Più componenti garantiti dalle analisi.','Więcej gwarantowanych komponentów z analiz.')
 ),
 blueprintAnalysis:rc(
  l('Blueprint Analysis','Bauplananalyse','Análisis de planos','Analyse de plans','Análise de projetos','Analisi progetti','Analiza schematów'),
  l('Analysis','Analyse','Análisis','Analyse','Análise','Analisi','Analiza'),
  l('More blueprint fragments from analyses.','Mehr Bauplanfragmente aus Analysen.','Más fragmentos de planos de los análisis.','Plus de fragments de plans via les analyses.','Mais fragmentos de projetos nas análises.','Più frammenti progetto dalle analisi.','Więcej fragmentów schematów z analiz.')
 ),
 modelArchitecture:rc(
  l('Model Architecture','Modellarchitektur','Arquitectura de modelo','Architecture de modèle','Arquitetura de modelo','Architettura modello','Architektura modelu'),
  l('Models','Modelle','Modelos','Modèles','Modelos','Modelli','Modele'),
  l('Multiplicative revenue increase per level; persists across prestiges.','Multiplikativer Umsatz-Sprung pro Stufe; skaliert dauerhaft über Prestiges.','Aumento multiplicativo de ingresos por nivel; persiste entre prestigios.','Hausse multiplicative des revenus par niveau ; persiste entre prestiges.','Aumento multiplicativo da receita por nível; persiste entre prestígios.','Aumento moltiplicativo dei ricavi per livello; persiste tra i prestigi.','Multiplikatywny wzrost przychodu na poziom; działa między prestiżami.')
 ),
 computeOptimization:rc(
  l('Compute Optimization','Compute-Optimierung','Optimización de cómputo','Optimisation du calcul','Otimização de computação','Ottimizzazione compute','Optymalizacja obliczeń'),
  l('Infrastructure','Infrastruktur','Infraestructura','Infrastructure','Infraestrutura','Infrastruttura','Infrastruktura'),
  l('Multiplicative global compute bonus per level.','Multiplikativer globaler Compute-Bonus pro Stufe.','Bonificación global multiplicativa de cómputo por nivel.','Bonus global multiplicatif de calcul par niveau.','Bônus global multiplicativo de computação por nível.','Bonus globale moltiplicativo al compute per livello.','Globalny multiplikatywny bonus obliczeń na poziom.')
 ),
 userScaling:rc(
  l('User Scaling','Nutzer-Skalierung','Escalado de usuarios','Mise à l’échelle utilisateurs','Escala de usuários','Scalabilità utenti','Skalowanie użytkowników'),
  l('Models','Modelle','Modelos','Modèles','Modelos','Modelli','Modele'),
  l('Multiplicative user capacity per level.','Multiplikative Nutzerkapazität pro Stufe.','Capacidad de usuarios multiplicativa por nivel.','Capacité utilisateurs multiplicative par niveau.','Capacidade de usuários multiplicativa por nível.','Capacità utenti moltiplicativa per livello.','Multiplikatywna pojemność użytkowników na poziom.')
 ),
 hardwareIntegration:rc(
  l('Hardware Integration','Hardware-Integration','Integración de hardware','Intégration matérielle','Integração de hardware','Integrazione hardware','Integracja sprzętu'),
  l('Infrastructure','Infrastruktur','Infraestructura','Infrastructure','Infraestrutura','Infrastruttura','Infrastruktura'),
  l('Exponentially strengthens late hardware classes.','Verstärkt späte Hardwareklassen exponentiell.','Refuerza exponencialmente las clases de hardware tardías.','Renforce exponentiellement les classes matérielles avancées.','Fortalece exponencialmente as classes de hardware tardias.','Potenzia esponenzialmente le classi hardware avanzate.','Wzmacnia wykładniczo późne klasy sprzętu.')
 ),
 labAutomation:rc(
  l('Lab Automation','Laborautomation','Automatización de laboratorio','Automatisation du laboratoire','Automação de laboratório','Automazione laboratorio','Automatyzacja laboratorium'),
  l('Automation','Automation','Automatización','Automatisation','Automação','Automazione','Automatyzacja'),
  l('Speeds up analyses; level 1 unlocks the research queue.','Beschleunigt Analysen; Stufe 1 schaltet die Forschungswarteschlange frei.','Acelera los análisis; nivel 1 desbloquea la cola de investigación.','Accélère les analyses ; niveau 1 débloque la file de recherche.','Acelera análises; nível 1 desbloqueia a fila de pesquisa.','Accelera le analisi; il livello 1 sblocca la coda di ricerca.','Przyspiesza analizy; poziom 1 odblokowuje kolejkę badań.')
 ),
 commercialization:rc(
  l('Commercialization','Kommerzialisierung','Comercialización','Commercialisation','Comercialização','Commercializzazione','Komercjalizacja'),
  l('Economy','Ökonomie','Economía','Économie','Economia','Economia','Ekonomia'),
  l('Multiplicative revenue per user; links model quality to monetization.','Multiplikativer Umsatz pro Nutzer; verbindet Modellqualität mit Monetarisierung.','Ingresos multiplicativos por usuario; conecta la calidad del modelo con la monetización.','Revenu multiplicatif par utilisateur ; relie qualité du modèle et monétisation.','Receita multiplicativa por usuário; conecta qualidade do modelo à monetização.','Ricavi moltiplicativi per utente; collega qualità del modello e monetizzazione.','Multiplikatywny przychód na użytkownika; łączy jakość modelu z monetyzacją.')
 ),
 networkEffects:rc(
  l('Network Effects','Netzwerkeffekte','Efectos de red','Effets de réseau','Efeitos de rede','Effetti di rete','Efekty sieciowe'),
  l('Economy','Ökonomie','Economía','Économie','Economia','Economia','Ekonomia'),
  l('User count creates a logarithmically scaling revenue multiplier.','Nutzerzahl erzeugt einen logarithmisch skalierenden Umsatzmultiplikator.','La cantidad de usuarios crea un multiplicador de ingresos logarítmico.','Le nombre d’utilisateurs crée un multiplicateur de revenus logarithmique.','O número de usuários cria um multiplicador de receita logarítmico.','Il numero di utenti crea un moltiplicatore dei ricavi logaritmico.','Liczba użytkowników tworzy logarytmicznie skalujący mnożnik przychodu.')
 ),
 parallelArchitecture:rc(
  l('Parallel Architecture','Parallele Architektur','Arquitectura paralela','Architecture parallèle','Arquitetura paralela','Architettura parallela','Architektura równoległa'),
  l('Compute','Compute','Cómputo','Calcul','Computação','Compute','Obliczenia'),
  l('Each unlocked hardware class boosts compute per research level.','Jede freigeschaltete Hardwareklasse verstärkt Compute pro Forschungsstufe.','Cada clase de hardware desbloqueada aumenta el cómputo por nivel.','Chaque classe matérielle débloquée augmente le calcul par niveau.','Cada classe de hardware desbloqueada aumenta a computação por nível.','Ogni classe hardware sbloccata aumenta il compute per livello.','Każda odblokowana klasa sprzętu zwiększa obliczenia na poziom.')
 ),
 hardwareCoDesign:rc(
  l('Hardware Co-Design','Hardware-Co-Design','Codiseño de hardware','Co-conception matérielle','Codesign de hardware','Co-design hardware','Współprojektowanie sprzętu'),
  l('Compute','Compute','Cómputo','Calcul','Computação','Compute','Obliczenia'),
  l('Model level and hardware classes jointly boost compute.','Model-Level und Hardwareklassen verstärken gemeinsam den Compute.','El nivel del modelo y las clases de hardware potencian juntos el cómputo.','Le niveau du modèle et les classes matérielles renforcent ensemble le calcul.','O nível do modelo e as classes de hardware aumentam juntos a computação.','Livello modello e classi hardware potenziano insieme il compute.','Poziom modelu i klasy sprzętu wspólnie zwiększają obliczenia.')
 ),
 syntheticData:rc(
  l('Synthetic Data','Synthetische Daten','Datos sintéticos','Données synthétiques','Dados sintéticos','Dati sintetici','Dane syntetyczne'),
  l('Data','Daten','Datos','Données','Dados','Dati','Dane'),
  l('Model level boosts data generation.','Model-Level verstärkt die Datenerzeugung.','El nivel del modelo aumenta la generación de datos.','Le niveau du modèle augmente la génération de données.','O nível do modelo aumenta a geração de dados.','Il livello modello aumenta la generazione dati.','Poziom modelu zwiększa generowanie danych.')
 ),
 dataFlywheel:rc(
  l('Data Flywheel','Data Flywheel','Data Flywheel','Data Flywheel','Data Flywheel','Data Flywheel','Data Flywheel'),
  l('Data','Daten','Datos','Données','Dados','Dati','Dane'),
  l('Exponentiates total Data Synergy per level.','Exponentiert die gesamte Data-Synergy pro Stufe.','Exponencia la sinergia total de datos por nivel.','Exponentie la synergie totale des données par niveau.','Exponencia a sinergia total de dados por nível.','Esponenzia la sinergia dati totale per livello.','Potęguje całkowitą synergię danych na poziom.')
 ),
 recursiveLearning:rc(
  l('Recursive Learning','Rekursives Lernen','Aprendizaje recursivo','Apprentissage récursif','Aprendizado recursivo','Apprendimento ricorsivo','Uczenie rekurencyjne'),
  l('Models','Modelle','Modelos','Modèles','Modelos','Modelli','Modele'),
  l('Exponentiates global Model Synergy per level.','Exponentiert die globale Model-Synergy pro Stufe.','Exponencia la sinergia global del modelo por nivel.','Exponentie la synergie globale du modèle par niveau.','Exponencia a sinergia global do modelo por nível.','Esponenzia la sinergia modello globale per livello.','Potęguje globalną synergię modelu na poziom.')
 ),
 autonomousScience:rc(
  l('Autonomous Science','Autonome Wissenschaft','Ciencia autónoma','Science autonome','Ciência autônoma','Scienza autonoma','Autonomiczna nauka'),
  l('Automation','Automation','Automatización','Automatisation','Automação','Automazione','Automatyzacja'),
  l('Research also scales with model level and reduces long-term micromanagement.','Forschung skaliert zusätzlich mit Model-Level und reduziert langfristig Mikromanagement.','La investigación también escala con el nivel del modelo y reduce la microgestión.','La recherche évolue aussi avec le niveau du modèle et réduit la microgestion.','A pesquisa também escala com o nível do modelo e reduz a microgestão.','La ricerca scala anche con il livello modello e riduce la microgestione.','Badania dodatkowo skalują się z poziomem modelu i ograniczają mikrozarządzanie.')
 ),
 tapAmplification:rc(
  l('Impulse Amplification','Impulsverstärkung','Amplificación de impulso','Amplification des impulsions','Amplificação de impulso','Amplificazione impulso','Wzmocnienie impulsu'),
  l('Active','Aktiv','Activo','Actif','Ativo','Attivo','Aktywne'),
  l('Each level multiplicatively strengthens active taps.','Jede Stufe verstärkt aktive Taps multiplikativ.','Cada nivel refuerza multiplicativamente los toques activos.','Chaque niveau renforce multiplicativement les actions actives.','Cada nível fortalece multiplicativamente os toques ativos.','Ogni livello potenzia moltiplicativamente i tap attivi.','Każdy poziom multiplikatywnie wzmacnia aktywne kliknięcia.')
 ),
 dropProtocols:rc(
  l('Signal Protocols','Signalprotokolle','Protocolos de señal','Protocoles de signal','Protocolos de sinal','Protocolli di segnale','Protokoły sygnałowe'),
  l('Active','Aktiv','Activo','Actif','Ativo','Attivo','Aktywne'),
  l('Increases frequency and quality of active signal drops.','Erhöht Häufigkeit und Qualität aktiver Signal-Drops.','Aumenta la frecuencia y calidad de los drops de señal activos.','Augmente la fréquence et la qualité des drops de signal actifs.','Aumenta a frequência e a qualidade dos drops de sinal ativos.','Aumenta frequenza e qualità dei drop di segnale attivi.','Zwiększa częstotliwość i jakość aktywnych dropów sygnału.')
 ),
};

export const researchText=(id:RepeatableResearchId,language:Language)=>{
 const x=research[id];
 return {name:pick(x.name,language),category:pick(x.category!,language),effect:pick(x.effect,language)};
};

const projects:Record<ResearchProjectId,{name:L;effect:L}>={
 operations:{
  name:l('Lab Automation','Labor-Automation','Automatización de laboratorio','Automatisation du laboratoire','Automação de laboratório','Automazione laboratorio','Automatyzacja laboratorium'),
  effect:l('Unlocks Lab Automation as a research breakthrough.','Schaltet Labor-Automation als Forschungsdurchbruch frei.','Desbloquea Automatización de laboratorio como avance.','Débloque Automatisation du laboratoire comme percée.','Desbloqueia Automação de laboratório como avanço.','Sblocca Automazione laboratorio come scoperta.','Odblokowuje Automatyzację laboratorium jako przełom.')
 },
 blueprints:{
  name:l('Open Blueprints','Offene Baupläne','Planos abiertos','Plans ouverts','Projetos abertos','Progetti aperti','Otwarte schematy'),
  effect:l('Unlocks advanced item recipes.','Schaltet fortgeschrittene Itemrezepte frei.','Desbloquea recetas avanzadas.','Débloque les recettes avancées.','Desbloqueia receitas avançadas.','Sblocca ricette avanzate.','Odblokowuje zaawansowane receptury.')
 },
 alignment:{
  name:l('Interpretable Models','Interpretierbare Modelle','Modelos interpretables','Modèles interprétables','Modelos interpretáveis','Modelli interpretabili','Interpretowalne modele'),
  effect:l('Unlocks the Interpretability prestige option.','Schaltet die Prestige-Option Interpretierbarkeit frei.','Desbloquea la opción de prestigio Interpretabilidad.','Débloque l’option de prestige Interprétabilité.','Desbloqueia a opção de prestígio Interpretabilidade.','Sblocca l’opzione prestigio Interpretabilità.','Odblokowuje opcję prestiżu Interpretowalność.')
 }
};

export const projectText=(id:ResearchProjectId,language:Language)=>({
 name:pick(projects[id].name,language),
 effect:pick(projects[id].effect,language),
});

/* =========================================================
   ANALYSIS / BREAKTHROUGHS
   ========================================================= */

const experiments:Record<ExperimentId,L>={
 hardware:l('Hardware Analysis','Hardwareanalyse','Análisis de hardware','Analyse matérielle','Análise de hardware','Analisi hardware','Analiza sprzętu'),
 architecture:l('Architecture Study','Architekturstudie','Estudio de arquitectura','Étude d’architecture','Estudo de arquitetura','Studio architettura','Badanie architektury'),
 artifact:l('Artifact Search','Artefaktsuche','Búsqueda de artefactos','Recherche d’artefacts','Busca de artefatos','Ricerca artefatti','Poszukiwanie artefaktów'),
};

export const experimentText=(id:ExperimentId,language:Language)=>pick(experiments[id],language);

const breakthroughs:Record<BreakthroughId,{name:L;effect:L}>={
 distillation:{
  name:l('Model Distillation','Modell-Destillation','Destilación de modelos','Distillation de modèle','Destilação de modelo','Distillazione modello','Destylacja modelu'),
  effect:l('+15% Credits','+15 % Credits','+15 % Créditos','+15 % Crédits','+15 % Créditos','+15 % Crediti','+15 % Kredytów')
 },
 graph:{
  name:l('Optimized Training Graph','Optimierter Trainingsgraph','Grafo de entrenamiento optimizado','Graphe d’entraînement optimisé','Grafo de treinamento otimizado','Grafo di training ottimizzato','Zoptymalizowany graf treningu'),
  effect:l('Legacy effect: fixed training durations are not accelerated','Legacy-Effekt: feste Trainingszeiten werden nicht beschleunigt','Efecto heredado: la duración fija no se acelera','Effet historique : la durée fixe n’est pas accélérée','Efeito legado: a duração fixa não é acelerada','Effetto legacy: la durata fissa non viene accelerata','Efekt historyczny: stały czas treningu nie jest przyspieszany')
 },
 planning:{
  name:l('Autonomous Lab Planning','Autonome Laborplanung','Planificación autónoma de laboratorio','Planification autonome du laboratoire','Planejamento autônomo de laboratório','Pianificazione autonoma laboratorio','Autonomiczne planowanie laboratorium'),
  effect:l('+20% Analysis Speed','+20 % Experimenttempo','+20 % Velocidad de análisis','+20 % Vitesse d’analyse','+20 % Velocidade de análise','+20 % Velocità analisi','+20 % Szybkości analizy')
 }
};

export const breakthroughText=(id:BreakthroughId,language:Language)=>({
 name:pick(breakthroughs[id].name,language),
 effect:pick(breakthroughs[id].effect,language),
});

/* =========================================================
   COMPONENTS
   ========================================================= */

type ComponentCopy={name:L;source:L};

const commonSource=l(
 'All drops and analyses · common',
 'Alle Drops und Analysen · häufig',
 'Todos los drops y análisis · común',
 'Tous les drops et analyses · commun',
 'Todos os drops e análises · comum',
 'Tutti i drop e analisi · comune',
 'Wszystkie dropy i analizy · pospolite'
);

const uncommonSource=l(
 'All drops and analyses · uncommon',
 'Alle Drops und Analysen · ungewöhnlich',
 'Todos los drops y análisis · poco común',
 'Tous les drops et analyses · peu commun',
 'Todos os drops e análises · incomum',
 'Tutti i drop e analisi · non comune',
 'Wszystkie dropy i analizy · niepospolite'
);

const rareSource=l(
 'All drops and analyses · rare',
 'Alle Drops und Analysen · selten',
 'Todos los drops y análisis · raro',
 'Tous les drops et analyses · rare',
 'Todos os drops e análises · raro',
 'Tutti i drop e analisi · raro',
 'Wszystkie dropy i analizy · rzadkie'
);

const components:Record<ComponentId,ComponentCopy>={
 circuits:{name:l('Circuits','Schaltkreise','Circuitos','Circuits','Circuitos','Circuiti','Obwody'),source:commonSource},
 copperCoils:{name:l('Copper Coils','Kupferspulen','Bobinas de cobre','Bobines de cuivre','Bobinas de cobre','Bobine di rame','Cewki miedziane'),source:commonSource},
 siliconWafers:{name:l('Silicon Wafers','Siliziumwafer','Obleas de silicio','Plaquettes de silicium','Wafers de silício','Wafer di silicio','Wafle krzemowe'),source:uncommonSource},
 titaniumBolts:{name:l('Titanium Alloy','Titanlegierung','Aleación de titanio','Alliage de titane','Liga de titânio','Lega di titanio','Stop tytanu'),source:uncommonSource},
 photonicLenses:{name:l('Photonic Lenses','Photonische Linsen','Lentes fotónicas','Lentilles photoniques','Lentes fotônicas','Lenti fotoniche','Soczewki fotoniczne'),source:rareSource},
 graphene:{name:l('Graphene','Graphen','Grafeno','Graphène','Grafeno','Grafene','Grafen'),source:rareSource},
 nanotubes:{name:l('Nanotubes','Nanoröhrchen','Nanotubos','Nanotubes','Nanotubos','Nanotubi','Nanorurki'),source:l('All drops and analyses · very rare','Alle Drops und Analysen · sehr selten','Todos los drops y análisis · muy raro','Tous les drops et analyses · très rare','Todos os drops e análises · muito raro','Tutti i drop e analisi · molto raro','Wszystkie dropy i analizy · bardzo rzadkie')},
 superconductors:{name:l('Superconductors','Supraleiter','Superconductores','Supraconducteurs','Supercondutores','Superconduttori','Nadprzewodniki'),source:l('All drops and analyses · extremely rare','Alle Drops und Analysen · extrem selten','Todos los drops y análisis · extremadamente raro','Tous les drops et analyses · extrêmement rare','Todos os drops e análises · extremamente raro','Tutti i drop e analisi · estremamente raro','Wszystkie dropy i analizy · ekstremalnie rzadkie')},
 neuralCrystals:{name:l('Neural Crystals','Neuralkristalle','Cristales neuronales','Cristaux neuronaux','Cristais neurais','Cristalli neurali','Kryształy neuronowe'),source:l('All drops and analyses · jackpot','Alle Drops und Analysen · Jackpot','Todos los drops y análisis · jackpot','Tous les drops et analyses · jackpot','Todos os drops e análises · jackpot','Tutti i drop e analisi · jackpot','Wszystkie dropy i analizy · jackpot')},
 quantumCores:{name:l('Quantum Cores','Quantenkerne','Núcleos cuánticos','Cœurs quantiques','Núcleos quânticos','Nuclei quantistici','Rdzenie kwantowe'),source:l('All drops and analyses · ultra jackpot','Alle Drops und Analysen · Ultra-Jackpot','Todos los drops y análisis · ultra jackpot','Tous les drops et analyses · ultra jackpot','Todos os drops e análises · ultra jackpot','Tutti i drop e analisi · ultra jackpot','Wszystkie dropy i analizy · ultra jackpot')}
};

export const componentText=(id:ComponentId,language:Language)=>({
 name:pick(components[id].name,language),
 source:pick(components[id].source,language),
});

/* =========================================================
   ITEMS / MODULES
   ========================================================= */

const rarities:Record<Rarity,L>={
 common:l('Common','Gewöhnlich','Común','Commun','Comum','Comune','Pospolity'),
 uncommon:l('Uncommon','Ungewöhnlich','Poco común','Peu commun','Incomum','Non comune','Niepospolity'),
 rare:l('Rare','Selten','Raro','Rare','Raro','Raro','Rzadki'),
 epic:l('Epic','Episch','Épico','Épique','Épico','Epico','Epicki'),
 legendary:l('Legendary','Legendär','Legendario','Légendaire','Lendário','Leggendario','Legendarny'),
 mythic:l('Mythic','Mythisch','Mítico','Mythique','Mítico','Mitico','Mityczny')
};

export const rarityText=(id:Rarity,language:Language)=>pick(rarities[id],language);

const itemNames:Record<ItemTypeId,L>={
 'insight-archive':l('Insight Archive','Erkenntnisarchiv','','','','',''),
 'impulse-relay':l('Impulse Relay','Impulsrelais','Relé de impulso','Relais d’impulsion','Relé de impulso','Relè d’impulso','Przekaźnik impulsowy'),
 'quantum-chip':l('Quantum Chip','Quantenchip','Chip cuántico','Puce quantique','Chip quântico','Chip quantistico','Chip kwantowy'),
 'neural-asic':l('Neural ASIC','Neural-ASIC','ASIC neuronal','ASIC neuronal','ASIC neural','ASIC neurale','Neuralny ASIC'),
 'photonic-array':l('Photonic Array','Photonenfeld','Matriz fotónica','Réseau photonique','Matriz fotônica','Array fotonico','Macierz fotoniczna'),
 'memory-crystal':l('Memory Crystal','Speicherkristall','Cristal de memoria','Cristal mémoire','Cristal de memória','Cristallo memoria','Kryształ pamięci'),
 'logic-seed':l('Logic Seed','Logik-Saat','Semilla lógica','Graine logique','Semente lógica','Seme logico','Ziarno logiki'),
 'tensor-core':l('Tensor Core','Tensor-Kern','Núcleo tensor','Cœur tensoriel','Núcleo tensor','Nucleo tensor','Rdzeń tensorowy'),
 'field-scanner':l('Field Scanner','Feldscanner','Escáner de campo','Scanner de champ','Scanner de campo','Scanner di campo','Skaner pola'),
 'lab-drone':l('Lab Drone','Labordrohne','Dron de laboratorio','Drone de laboratoire','Drone de laboratório','Drone laboratorio','Dron laboratoryjny'),
 'data-prism':l('Data Prism','Datenprisma','Prisma de datos','Prisme de données','Prisma de dados','Prisma dati','Pryzmat danych')
};

export const itemText=(id:ItemTypeId,language:Language)=>pick(itemNames[id],language);

const effects:Record<ItemEffect,L>={
 'int-yield':l('+25% weighted INT revenue for future eligible income','+25 % gewichteter INT-Einnahmewert für zukünftige berechtigte Einnahmen','','','','',''),
 relay:l('Every 10th paid tap: +2 seconds of Credits','Jeder 10. vergütete Tap: +2 Sekunden Credits','Cada 10.º toque pagado: +2 segundos de créditos','Chaque 10e impulsion payée : +2 secondes de crédits','Cada 10.º toque pago: +2 segundos de créditos','Ogni 10° tap pagato: +2 secondi di crediti','Co 10. płatne kliknięcie: +2 sekundy kredytów'),
 compute:l('Compute','Compute','Cómputo','Calcul','Computação','Compute','Obliczenia'),
 credits:l('Credits','Credits','Créditos','Crédits','Créditos','Crediti','Kredyty'),
 data:l('Data','Daten','Datos','Données','Dados','Dati','Dane'),
 research:l('Research','Forschung','Investigación','Recherche','Pesquisa','Ricerca','Badania'),
 training:l('Legacy training bonus (fixed duration unchanged)','Legacy-Trainingsbonus (feste Dauer unverändert)','Bono de entrenamiento heredado (duración fija)','Bonus d’entraînement historique (durée fixe)','Bônus legado de treino (duração fixa)','Bonus training legacy (durata fissa)','Historyczny bonus treningu (stały czas)'),
 experiment:l('Analysis','Analyse','Análisis','Analyse','Análise','Analisi','Analiza'),
 components:l('Components','Komponenten','Componentes','Composants','Componentes','Componenti','Komponenty'),
 tap:l('Tap','Tap','Toque','Impulsion','Toque','Tap','Kliknięcie'),
 drop:l('Drop','Drop','Drop','Drop','Drop','Drop','Drop')
};

export const effectText=(id:ItemEffect,language:Language)=>pick(effects[id],language);

export const moduleText=(id:'computeBus'|'dataLattice',language:Language)=>{
 const names={
  computeBus:l('Compute Bus','Compute-Bus','Bus de cómputo','Bus de calcul','Barramento de computação','Bus compute','Magistrala obliczeniowa'),
  dataLattice:l('Data Lattice','Daten-Gitter','Red de datos','Treillis de données','Malha de dados','Reticolo dati','Sieć danych')
 };
 return pick(names[id],language);
};

export const recipeText=(id:ItemTypeId,language:Language)=>{
 const suffix=l(' Blueprint','-Bauplan',' · Plano',' · Plan',' · Projeto',' · Progetto',' · Schemat');
 const base=itemText(id,language);
 const s=pick(suffix,language);
 return language==='de'?`${base}${s}`:language==='en'?`${base}${s}`:`${base}${s}`;
};

/* =========================================================
   PRESTIGE
   ========================================================= */

const branches=[
 l('Data Archive','Datenarchiv','Archivo de datos','Archive de données','Arquivo de dados','Archivio dati','Archiwum danych'),
 l('Compute Network','Compute-Netz','Red de cómputo','Réseau de calcul','Rede de computação','Rete compute','Sieć obliczeniowa'),
 l('Analysis','Analyse','Análisis','Analyse','Análise','Analisi','Analiza'),
 l('Labs','Labore','Laboratorios','Laboratoires','Laboratórios','Laboratori','Laboratoria'),
 l('Manufacturing','Fertigung','Fabricación','Fabrication','Fabricação','Produzione','Produkcja'),
] as const;

const roman=['','I','II','III','IV','V','VI','VII','VIII'];

const prestigeEffects:Record<PrestigeUpgradeId,L>={
 shoppingAgent:l('Per-class calculator and single-board computer autobuyers with a shared reserve.','Klassenweise Autobuyer für Taschenrechner und Einplatinencomputer mit gemeinsamer Reserve.','','','','',''),
 trainingPlan:l('Queue two model training jobs; data is charged only when each job starts.','Zwei Modelltrainings vormerken; Daten werden erst beim jeweiligen Start abgezogen.','','','','',''),
 componentScanner:l('Double one accessible passive component weight without adding finds.','Verdoppelt ein zugängliches passives Komponentengewicht, ohne zusätzliche Funde zu erzeugen.','','','','',''),
 milestoneMemory:l('+2% weighted INT revenue per distinct hardware milestone edge this run, up to +100%.','+2 % gewichteter INT-Einnahmewert je unterschiedlicher Hardware-Meilensteinkante dieses Runs, maximal +100 %.','','','','',''),
 modelSynthesis:l('+3% weighted INT revenue per completed training this run, up to +150%.','+3 % gewichteter INT-Einnahmewert je abgeschlossenem Training dieses Runs, maximal +150 %.','','','','',''),
 researchArchive:l('+5% weighted INT revenue per completed research job this run, up to +200%.','+5 % gewichteter INT-Einnahmewert je abgeschlossenem Forschungsauftrag dieses Runs, maximal +200 %.','','','','',''),
 dataArchive1:l('×1.25 data production.','×1,25 Datenproduktion.','×1,25 producción de datos.','×1,25 production de données.','×1,25 produção de dados.','×1,25 produzione dati.','×1,25 produkcji danych.'),
 dataArchive2:l('×1.60 data production.','×1,60 Datenproduktion.','×1,60 producción de datos.','×1,60 production de données.','×1,60 produção de dados.','×1,60 produzione dati.','×1,60 produkcji danych.'),
 dataArchive3:l('×2.25 data production.','×2,25 Datenproduktion.','×2,25 producción de datos.','×2,25 production de données.','×2,25 produção de dados.','×2,25 produzione dati.','×2,25 produkcji danych.'),
 dataArchive4:l('Data Synergy ^1.05; data items scale with rare components.','Data Synergy ^1,05; Daten-Items skalieren mit seltenen Komponenten.','Sinergia de datos ^1,05; los objetos de datos escalan con componentes raros.','Synergie de données ^1,05 ; les objets de données évoluent avec les composants rares.','Sinergia de dados ^1,05; itens de dados escalam com componentes raros.','Sinergia dati ^1,05; gli oggetti dati scalano con componenti rari.','Synergia danych ^1,05; przedmioty danych skalują się z rzadkimi komponentami.'),
 dataArchive5:l('Data Synergy ^1.10.','Data Synergy ^1,10.','Sinergia de datos ^1,10.','Synergie de données ^1,10.','Sinergia de dados ^1,10.','Sinergia dati ^1,10.','Synergia danych ^1,10.'),
 dataArchive6:l('Lifetime data strengthens DataPower; data production ×2.5.','Lifetime-Daten verstärken DataPower; Datenproduktion ×2,5.','Los datos acumulados refuerzan DataPower; producción ×2,5.','Les données à vie renforcent DataPower ; production ×2,5.','Dados vitalícios fortalecem DataPower; produção ×2,5.','I dati lifetime rafforzano DataPower; produzione ×2,5.','Dane lifetime wzmacniają DataPower; produkcja ×2,5.'),
 dataArchive7:l('Additional Data Synergy ^1.05; data production ×3.5.','Data Synergy ^1,05 zusätzlich; Datenproduktion ×3,5.','Sinergia de datos adicional ^1,05; producción ×3,5.','Synergie de données supplémentaire ^1,05 ; production ×3,5.','Sinergia de dados adicional ^1,05; produção ×3,5.','Sinergia dati aggiuntiva ^1,05; produzione ×3,5.','Dodatkowa synergia danych ^1,05; produkcja ×3,5.'),
 dataArchive8:l('Additional Data Synergy ^1.10; data production ×5.','Data Synergy ^1,10 zusätzlich; Datenproduktion ×5.','Sinergia de datos adicional ^1,10; producción ×5.','Synergie de données supplémentaire ^1,10 ; production ×5.','Sinergia de dados adicional ^1,10; produção ×5.','Sinergia dati aggiuntiva ^1,10; produzione ×5.','Dodatkowa synergia danych ^1,10; produkcja ×5.'),

 computeNet1:l('+8% global compute per unlocked hardware class.','+8 % globaler Compute je freigeschalteter Hardwareklasse.','+8 % de cómputo global por clase desbloqueada.','+8 % de calcul global par classe débloquée.','+8 % de computação global por classe desbloqueada.','+8 % compute globale per classe sbloccata.','+8% globalnych obliczeń za odblokowaną klasę.'),
 computeNet2:l('+15% global compute per unlocked hardware class.','+15 % globaler Compute je freigeschalteter Hardwareklasse.','+15 % de cómputo global por clase desbloqueada.','+15 % de calcul global par classe débloquée.','+15 % de computação global por classe desbloqueada.','+15 % compute globale per classe sbloccata.','+15% globalnych obliczeń za odblokowaną klasę.'),
 computeNet3:l('+30% global compute per unlocked hardware class.','+30 % globaler Compute je freigeschalteter Hardwareklasse.','+30 % de cómputo global por clase desbloqueada.','+30 % de calcul global par classe débloquée.','+30 % de computação global por classe desbloqueada.','+30 % compute globale per classe sbloccata.','+30% globalnych obliczeń za odblokowaną klasę.'),
 computeNet4:l('Hardware ownership synergy ^1.05; legacy infrastructure activates at 500 units per class.','Hardware-Besitzsynergie ^1,05; Legacy-Infrastruktur ab 500 Stück je Klasse wird aktiv.','Sinergia de hardware ^1,05; infraestructura legacy activa a 500 unidades por clase.','Synergie matérielle ^1,05 ; infrastructure legacy active à 500 unités par classe.','Sinergia de hardware ^1,05; infraestrutura legacy ativa com 500 unidades por classe.','Sinergia hardware ^1,05; infrastruttura legacy attiva a 500 unità per classe.','Synergia posiadania sprzętu ^1,05; infrastruktura legacy aktywuje się przy 500 sztukach klasy.'),
 computeNet5:l('Class diversity becomes stronger; every legacy class boosts global output.','Klassen-Diversität wird stärker; jede Legacy-Klasse verstärkt globalen Output.','La diversidad de clases aumenta; cada clase legacy mejora la producción global.','La diversité des classes augmente ; chaque classe legacy renforce la production globale.','A diversidade de classes aumenta; cada classe legacy melhora a produção global.','La diversità delle classi aumenta; ogni classe legacy potenzia l’output globale.','Różnorodność klas rośnie; każda klasa legacy wzmacnia globalną produkcję.'),
 computeNet6:l('Class diversity grows stronger; global compute ×2.','Klassen-Diversität wächst stärker; globaler Compute ×2.','La diversidad de clases aumenta; cómputo global ×2.','La diversité des classes augmente ; calcul global ×2.','A diversidade de classes aumenta; computação global ×2.','La diversità delle classi aumenta; compute globale ×2.','Różnorodność klas rośnie; globalne obliczenia ×2.'),
 computeNet7:l('Additional hardware ownership synergy ^1.05; compute ×2.5.','Hardware-Besitzsynergie ^1,05 zusätzlich; Compute ×2,5.','Sinergia adicional de hardware ^1,05; cómputo ×2,5.','Synergie matérielle supplémentaire ^1,05 ; calcul ×2,5.','Sinergia adicional de hardware ^1,05; computação ×2,5.','Sinergia hardware aggiuntiva ^1,05; compute ×2,5.','Dodatkowa synergia sprzętu ^1,05; obliczenia ×2,5.'),
 computeNet8:l('Hardware and infrastructure synergies become late-game wallbreakers.','Hardware- und Infrastruktur-Synergien werden zu Late-Game-Wallbreakern.','Las sinergias de hardware e infraestructura rompen barreras del late game.','Les synergies matériel/infrastructure brisent les murs de fin de jeu.','Sinergias de hardware e infraestrutura quebram barreiras do late game.','Le sinergie hardware/infrastruttura rompono le barriere del late game.','Synergie sprzętu i infrastruktury przełamują bariery late game.'),

 analysis1:l('+10% component finds from analyses.','+10 % Komponentenfunde aus Analysen.','+10 % componentes encontrados en análisis.','+10 % composants trouvés via analyses.','+10 % componentes encontrados em análises.','+10 % componenti trovati dalle analisi.','+10% komponentów z analiz.'),
 analysis2:l('+20% component finds from analyses.','+20 % Komponentenfunde aus Analysen.','+20 % componentes encontrados en análisis.','+20 % composants trouvés via analyses.','+20 % componentes encontrados em análises.','+20 % componenti trovati dalle analisi.','+20% komponentów z analiz.'),
 analysis3:l('+30% component finds; every analysis guarantees at least one rare component.','+30 % Komponentenfunde; jede Analyse garantiert mindestens eine seltene Komponente.','+30 % componentes; cada análisis garantiza al menos un componente raro.','+30 % composants ; chaque analyse garantit au moins un composant rare.','+30 % componentes; cada análise garante pelo menos um componente raro.','+30 % componenti; ogni analisi garantisce almeno un componente raro.','+30% komponentów; każda analiza gwarantuje co najmniej jeden rzadki komponent.'),
 analysis4:l('+25% analysis speed.','+25 % Analysegeschwindigkeit.','+25 % velocidad de análisis.','+25 % vitesse d’analyse.','+25 % velocidade de análise.','+25 % velocità analisi.','+25% szybkości analizy.'),
 analysis5:l('+50% analysis speed.','+50 % Analysegeschwindigkeit.','+50 % velocidad de análisis.','+50 % vitesse d’analyse.','+50 % velocidade de análise.','+50 % velocità analisi.','+50% szybkości analizy.'),
 analysis6:l('Rare item secondary effects ×1.25; analysis speed ×2.','Seltene Item-Sekundäreffekte ×1,25; Analysegeschwindigkeit ×2.','Efectos secundarios raros ×1,25; velocidad de análisis ×2.','Effets secondaires rares ×1,25 ; vitesse d’analyse ×2.','Efeitos secundários raros ×1,25; velocidade de análise ×2.','Effetti secondari rari ×1,25; velocità analisi ×2.','Rzadkie efekty dodatkowe ×1,25; szybkość analizy ×2.'),
 analysis7:l('Legendary/mythic tertiary effects ×1.35; analysis speed ×2.5.','Legendäre/mythische Tertiäreffekte ×1,35; Analysegeschwindigkeit ×2,5.','Efectos terciarios legendarios/míticos ×1,35; análisis ×2,5.','Effets tertiaires légendaires/mythiques ×1,35 ; analyse ×2,5.','Efeitos terciários lendários/míticos ×1,35; análise ×2,5.','Effetti terziari leggendari/mitici ×1,35; analisi ×2,5.','Legendarne/mityczne efekty trzeciorzędne ×1,35; analiza ×2,5.'),
 analysis8:l('Item synergies additionally benefit from rare components.','Item-Synergien profitieren zusätzlich von seltenen Komponenten.','Las sinergias de objetos se benefician además de componentes raros.','Les synergies d’objets profitent aussi des composants rares.','Sinergias de itens também se beneficiam de componentes raros.','Le sinergie degli oggetti beneficiano anche dei componenti rari.','Synergie przedmiotów dodatkowo korzystają z rzadkich komponentów.'),

 labs1:l('Second research slot.','Zweiter Forschungsslot.','Segunda ranura de investigación.','Deuxième emplacement de recherche.','Segundo espaço de pesquisa.','Secondo slot di ricerca.','Drugi slot badawczy.'),
 labs2:l('Research queue with 2 slots.','Forschungsschlange mit 2 Plätzen.','Cola de investigación con 2 espacios.','File de recherche avec 2 places.','Fila de pesquisa com 2 espaços.','Coda di ricerca con 2 posti.','Kolejka badań z 2 miejscami.'),
 labs3:l('Automatically starts the next research when its data cost is affordable.','Startet die nächste Forschung automatisch, sobald die Datenmenge bezahlbar ist.','Inicia automáticamente la siguiente investigación cuando los datos son suficientes.','Démarre automatiquement la recherche suivante lorsque les données suffisent.','Inicia automaticamente a próxima pesquisa quando houver dados suficientes.','Avvia automaticamente la ricerca successiva quando i dati sono sufficienti.','Automatycznie uruchamia następne badanie, gdy wystarczy danych.'),
 labs4:l('Research Synergy ^1.05 and stronger Model↔Research coupling.','Research Synergy ^1,05 und stärkere Model↔Research-Kopplung.','Sinergia de investigación ^1,05 y mayor conexión Modelo↔Investigación.','Synergie de recherche ^1,05 et couplage Modèle↔Recherche renforcé.','Sinergia de pesquisa ^1,05 e conexão Modelo↔Pesquisa mais forte.','Sinergia ricerca ^1,05 e legame Modello↔Ricerca più forte.','Synergia badań ^1,05 i silniejsze połączenie Model↔Badania.'),
 labs5:l('Model autopilot alternates quality and efficiency training automatically.','Modell-Autopilot: trainiert Qualität und Effizienz automatisch im Wechsel.','Piloto automático: alterna calidad y eficiencia automáticamente.','Pilote automatique : alterne qualité et efficacité automatiquement.','Piloto automático: alterna qualidade e eficiência automaticamente.','Autopilota: alterna automaticamente qualità ed efficienza.','Autopilot modelu automatycznie zmienia trening jakości i wydajności.'),
 labs6:l('Research Synergy ×1.5; permanent research scales with model level.','Research Synergy ×1,5; permanente Forschung skaliert mit Model-Level.','Sinergia de investigación ×1,5; la investigación permanente escala con el modelo.','Synergie de recherche ×1,5 ; la recherche permanente évolue avec le modèle.','Sinergia de pesquisa ×1,5; pesquisa permanente escala com o modelo.','Sinergia ricerca ×1,5; ricerca permanente scala con il modello.','Synergia badań ×1,5; stałe badania skalują się z poziomem modelu.'),
 labs7:l('Research Synergy ^1.05; research ×2.','Research Synergy ^1,05; Forschung ×2.','Sinergia de investigación ^1,05; investigación ×2.','Synergie de recherche ^1,05 ; recherche ×2.','Sinergia de pesquisa ^1,05; pesquisa ×2.','Sinergia ricerca ^1,05; ricerca ×2.','Synergia badań ^1,05; badania ×2.'),
 labs8:l('Research Synergy ^1.10; research ×3.','Research Synergy ^1,10; Forschung ×3.','Sinergia de investigación ^1,10; investigación ×3.','Synergie de recherche ^1,10 ; recherche ×3.','Sinergia de pesquisa ^1,10; pesquisa ×3.','Sinergia ricerca ^1,10; ricerca ×3.','Synergia badań ^1,10; badania ×3.'),

 manufacturing1:l('Second item slot.','Zweiter Item-Sockel.','Segunda ranura de objeto.','Deuxième emplacement d’objet.','Segundo espaço de item.','Secondo slot oggetto.','Drugi slot przedmiotu.'),
 manufacturing2:l('Item upgrade costs −15%.','Item-Upgrade-Kosten −15 %.','Costes de mejora de objetos −15 %.','Coûts d’amélioration des objets −15 %.','Custos de melhoria de itens −15 %.','Costi upgrade oggetti −15 %.','Koszty ulepszania przedmiotów −15%.'),
 manufacturing3:l('Deepens manufacturing infrastructure; base modules are already unlocked by Open Blueprints.','Vertieft die Fertigungsinfrastruktur; Basis-Module werden bereits durch Offene Baupläne freigeschaltet.','Amplía la infraestructura de fabricación; los módulos básicos ya se desbloquean con Planos abiertos.','Renforce l’infrastructure de fabrication ; les modules de base sont déjà débloqués par Plans ouverts.','Aprofunda a infraestrutura de fabricação; módulos básicos já são desbloqueados por Projetos abertos.','Approfondisce l’infrastruttura produttiva; i moduli base sono già sbloccati da Progetti aperti.','Rozwija infrastrukturę produkcji; podstawowe moduły odblokowują już Otwarte schematy.'),
 manufacturing4:l('Item Synergy ^1.05; items scale with hardware, model and data.','Item-Synergien ^1,05; Items skalieren mit Hardware, Model und Daten.','Sinergia de objetos ^1,05; objetos escalan con hardware, modelo y datos.','Synergie d’objets ^1,05 ; les objets évoluent avec matériel, modèle et données.','Sinergia de itens ^1,05; itens escalam com hardware, modelo e dados.','Sinergia oggetti ^1,05; gli oggetti scalano con hardware, modello e dati.','Synergia przedmiotów ^1,05; przedmioty skalują się ze sprzętem, modelem i danymi.'),
 manufacturing5:l('Third item slot.','Dritter Item-Sockel.','Tercera ranura de objeto.','Troisième emplacement d’objet.','Terceiro espaço de item.','Terzo slot oggetto.','Trzeci slot przedmiotu.'),
 manufacturing6:l('Stronger secondary item effects; Item Synergy ^1.05.','Sekundäre Itemeffekte stärker; Item-Synergie ^1,05.','Efectos secundarios más fuertes; sinergia de objetos ^1,05.','Effets secondaires renforcés ; synergie d’objets ^1,05.','Efeitos secundários mais fortes; sinergia de itens ^1,05.','Effetti secondari più forti; sinergia oggetti ^1,05.','Silniejsze efekty dodatkowe; synergia przedmiotów ^1,05.'),
 manufacturing7:l('Stronger tertiary item effects; Item Synergy ^1.07.','Tertiäre Itemeffekte stärker; Item-Synergie ^1,07.','Efectos terciarios más fuertes; sinergia de objetos ^1,07.','Effets tertiaires renforcés ; synergie d’objets ^1,07.','Efeitos terciários mais fortes; sinergia de itens ^1,07.','Effetti terziari più forti; sinergia oggetti ^1,07.','Silniejsze efekty trzeciorzędne; synergia przedmiotów ^1,07.'),
 manufacturing8:l('Item Synergy ^1.10; Forge/Fusion become true endgame scalers.','Item-Synergie ^1,10; Forge/Fusion werden echte Endgame-Skalierer.','Sinergia de objetos ^1,10; Forja/Fusión se convierten en escaladores de endgame.','Synergie d’objets ^1,10 ; Forge/Fusion deviennent de vrais moteurs de fin de jeu.','Sinergia de itens ^1,10; Forja/Fusão viram escaladores de endgame.','Sinergia oggetti ^1,10; Forgia/Fusione diventano veri scaler endgame.','Synergia przedmiotów ^1,10; Kuźnia/Fuzja stają się prawdziwymi skalami endgame.')
};

export const prestigeText=(id:PrestigeUpgradeId,language:Language)=>{
 if(id==='shoppingAgent'||id==='trainingPlan'||id==='componentScanner')return{name:pick(id==='shoppingAgent'?l('Shopping Agent','Einkaufsagent','','','','',''):id==='trainingPlan'?l('Training Plan','Trainingsplan','','','','',''):l('Component Scanner','Komponentenscanner','','','','',''),language),effect:pick(prestigeEffects[id],language)};
 const depth=Number(id.match(/([1-8])$/)?.[1]??1);
 const branch=id.startsWith('dataArchive')?0:id.startsWith('computeNet')?1:id.startsWith('analysis')?2:id.startsWith('labs')?3:4;
 return {
  name:`${pick(branches[branch],language)} ${roman[depth]}`,
  effect:pick(prestigeEffects[id],language),
 };
};
