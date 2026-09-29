export const languages=['en','de','es','fr','pt','it','pl'] as const;
export type Language=typeof languages[number];
export type NumberFormat='auto'|'scientific'|'engineering';
export const languageNames:Record<Language,string>={en:'English',de:'Deutsch',es:'Español',fr:'Français',pt:'Português',it:'Italiano',pl:'Polski'};
const en={profile:'Profile',collection:'Collection',challenges:'Challenges',seasons:'Seasons',stats:'Stats',inbox:'Inbox',settings:'Settings',playerProfile:'Player Profile',showcase:'Showcase',noArtifact:'No Season Artifact yet',seasonHistory:'Season History',active:'active',language:'Language',numberFormat:'Number format',animations:'Animations / FX',music:'Music',muteEffects:'Mute effects',playerName:'Player name',daily:'Daily',weekly:'Weekly',monthly:'Monthly',quests:'Quests',claim:'Claim',running:'Running',season:'Season',neuralSeason:'30-DAY NEURAL SEASON',level:'Level',artifact:'Artifact',hardwareMastery:'Hardware Mastery',challengeStars:'Challenge Stars',accountChallenges:'Account Challenges',challengeRuns:'Challenge Runs',start:'Start',abort:'Abort',completeChallenge:'Complete challenge',notReady:'Not ready',goal:'Goal',lifetimeCredits:'Lifetime Credits',prestiges:'Prestiges',hardwareBought:'Hardware bought',taps:'Taps',components:'Components',research:'Research',items:'Items',activeTime:'Active time',markRead:'Mark as read',hardwareDiscovered:'Hardware discovered',componentsDiscovered:'Components discovered',itemTypes:'Item types',artifacts:'Artifacts',unlockAt500:'Unlock at 500 units',workshop:'Workshop',inventory:'Inventory',prestige:'Prestige',missions:'Missions',seasonLevel:'Season 01 · Level {level}/{max}',free:'Free',premiumInactive:'Premium · inactive',rewardTrack:'Reward track',premiumChest:'Premium chest',passInactive:'Pass inactive',missionConsole:'MISSION CONSOLE',rewardReady:'Reward ready',questPeriod:'Quest period',claimed:'Claimed',claimable:'Claimable',locked:'Locked',stillLocked:'Still locked',premiumRewardLocked:'Premium reward level {level}, locked',percentToNextLevel:'{percent}% to next level',of:'of',xpUntilLevel:'XP until level {level}',closeProfile:'Close profile',profileSections:'Profile sections',achievementScore:'Achievement Score',seasonLevelShort:'Season Lv. {level}',masteryLevel:'Mastery {level}',masteryComputeBonus:'{xp} XP · +{percent}% Compute',seasonArtifacts:'Season Artifacts',activeChallenge:'Active: {name}',challengeGoalInt:'Run progress: {progress} / 1 INT from eligible revenue earned after this challenge started.',clears:'Clears {count}',bestMinutes:'Best {minutes} min',open:'Open',completed:'completed',seasonHistoryStatus:'{level}/{max} Level · {status}'};
type Key=keyof typeof en;
const de:Partial<Record<Key,string>>={profile:'Profil',collection:'Sammlung',challenges:'Challenges',seasons:'Seasons',stats:'Statistik',inbox:'Nachrichten',settings:'Einstellungen',playerProfile:'Spielerprofil',showcase:'Vitrine',noArtifact:'Noch kein Season-Artefakt',seasonHistory:'Season-Verlauf',active:'aktiv',language:'Sprache',numberFormat:'Zahlenformat',animations:'Animationen / FX',music:'Musik',muteEffects:'Effekte stumm',playerName:'Spielername',daily:'Täglich',weekly:'Wöchentlich',monthly:'Monatlich',quests:'Quests',claim:'Abholen',running:'Läuft',season:'Season',neuralSeason:'30-TAGE NEURAL SEASON',level:'Level',artifact:'Artefakt',hardwareMastery:'Hardware-Mastery',challengeStars:'Challenge-Sterne',accountChallenges:'Account-Challenges',challengeRuns:'Challenge-Runs',start:'Start',abort:'Abbrechen',completeChallenge:'Challenge abschließen',notReady:'Noch nicht bereit',goal:'Ziel',lifetimeCredits:'Lifetime Credits',prestiges:'Prestiges',hardwareBought:'Hardware gekauft',taps:'Taps',components:'Komponenten',research:'Forschungen',items:'Items',activeTime:'Aktive Zeit',markRead:'Als gelesen markieren',hardwareDiscovered:'Hardware entdeckt',componentsDiscovered:'Komponenten entdeckt',itemTypes:'Item-Typen',artifacts:'Artefakte',unlockAt500:'500 Einheiten zum Freischalten',workshop:'Werkstatt',inventory:'Inventar',prestige:'Prestige',missions:'Missionen',seasonLevel:'Season 01 · Level {level}/{max}',free:'Kostenlos',premiumInactive:'Premium · nicht aktiv',rewardTrack:'Belohnungsspur',premiumChest:'Premium-Kiste',passInactive:'Pass nicht aktiv',missionConsole:'MISSIONSKONSOLE',rewardReady:'Belohnung bereit',questPeriod:'Quest-Zeitraum',claimed:'Abgeholt',claimable:'Abholbar',locked:'Gesperrt',stillLocked:'Noch gesperrt',premiumRewardLocked:'Premium-Belohnung Level {level}, gesperrt',percentToNextLevel:'{percent}% bis zum nächsten Level',of:'von',xpUntilLevel:'XP bis Level {level}',closeProfile:'Profil schließen',profileSections:'Profilbereiche',achievementScore:'Achievement-Punkte',seasonLevelShort:'Season Lv. {level}',masteryLevel:'Mastery {level}',masteryComputeBonus:'{xp} XP · +{percent}% Compute',seasonArtifacts:'Season-Artefakte',activeChallenge:'Aktiv: {name}',challengeGoalInt:'Run-Fortschritt: {progress} / 1 INT aus prestigeberechtigtem Umsatz seit Challenge-Start.',clears:'Abschlüsse {count}',bestMinutes:'Bestzeit {minutes} Min.',open:'Offen',completed:'abgeschlossen',seasonHistoryStatus:'{level}/{max} Level · {status}'};
const es:Partial<Record<Key,string>>={profile:'Perfil',collection:'Colección',challenges:'Desafíos',seasons:'Temporadas',stats:'Estadísticas',inbox:'Mensajes',settings:'Ajustes',language:'Idioma',numberFormat:'Formato numérico',daily:'Diario',weekly:'Semanal',monthly:'Mensual',quests:'Misiones',claim:'Reclamar',running:'En curso',workshop:'Taller',research:'Investigación',inventory:'Inventario',prestige:'Prestigio',missions:'Misiones',seasonLevel:'Temporada 01 · Nivel {level}/{max}',free:'Gratis',premiumInactive:'Premium · inactivo',rewardTrack:'Ruta de recompensas',premiumChest:'Cofre premium',passInactive:'Pase inactivo',missionConsole:'CONSOLA DE MISIONES',rewardReady:'Recompensa disponible',questPeriod:'Periodo de misiones',claimed:'Reclamado',claimable:'Disponible',locked:'Bloqueado',stillLocked:'Aún bloqueado',premiumRewardLocked:'Recompensa premium de nivel {level}, bloqueada',percentToNextLevel:'{percent}% para el siguiente nivel',of:'de',xpUntilLevel:'XP hasta el nivel {level}',closeProfile:'Cerrar perfil',profileSections:'Secciones del perfil',achievementScore:'Puntos de logros',seasonLevelShort:'Nivel de temporada {level}',masteryLevel:'Maestría {level}',masteryComputeBonus:'{xp} XP · +{percent}% de cómputo',seasonArtifacts:'Artefactos de temporada',activeChallenge:'Activo: {name}',challengeGoalInt:'Objetivo: 1 INT bajo la regla especial.',clears:'Completados {count}',bestMinutes:'Mejor {minutes} min',open:'Pendiente',completed:'completada',seasonHistoryStatus:'{level}/{max} niveles · {status}'};
const fr:Partial<Record<Key,string>>={profile:'Profil',collection:'Collection',challenges:'Défis',seasons:'Saisons',stats:'Statistiques',inbox:'Messages',settings:'Réglages',language:'Langue',numberFormat:'Format des nombres',daily:'Quotidien',weekly:'Hebdo',monthly:'Mensuel',quests:'Quêtes',claim:'Récupérer',running:'En cours',workshop:'Atelier',research:'Recherche',inventory:'Inventaire',prestige:'Prestige',missions:'Missions',seasonLevel:'Saison 01 · Niveau {level}/{max}',free:'Gratuit',premiumInactive:'Premium · inactif',rewardTrack:'Parcours de récompenses',premiumChest:'Coffre premium',passInactive:'Pass inactif',missionConsole:'CONSOLE DE MISSIONS',rewardReady:'Récompense disponible',questPeriod:'Période des quêtes',claimed:'Récupéré',claimable:'Disponible',locked:'Verrouillé',stillLocked:'Encore verrouillé',premiumRewardLocked:'Récompense premium niveau {level}, verrouillée',percentToNextLevel:'{percent}% avant le niveau suivant',of:'sur',xpUntilLevel:"XP jusqu'au niveau {level}",closeProfile:'Fermer le profil',profileSections:'Sections du profil',achievementScore:'Points de succès',seasonLevelShort:'Niveau de saison {level}',masteryLevel:'Maîtrise {level}',masteryComputeBonus:'{xp} XP · +{percent}% de calcul',seasonArtifacts:'Artefacts de saison',activeChallenge:'Actif : {name}',challengeGoalInt:'Objectif : 1 INT avec la règle spéciale.',clears:'Réussites {count}',bestMinutes:'Meilleur {minutes} min',open:'Ouvert',completed:'terminée',seasonHistoryStatus:'{level}/{max} niveaux · {status}'};
const pt:Partial<Record<Key,string>>={profile:'Perfil',collection:'Coleção',challenges:'Desafios',seasons:'Temporadas',stats:'Estatísticas',inbox:'Mensagens',settings:'Definições',language:'Idioma',numberFormat:'Formato numérico',daily:'Diário',weekly:'Semanal',monthly:'Mensal',quests:'Missões',claim:'Resgatar',running:'Em curso',workshop:'Oficina',research:'Pesquisa',inventory:'Inventário',prestige:'Prestígio',missions:'Missões',seasonLevel:'Temporada 01 · Nível {level}/{max}',free:'Grátis',premiumInactive:'Premium · inativo',rewardTrack:'Trilha de recompensas',premiumChest:'Baú premium',passInactive:'Passe inativo',missionConsole:'CONSOLE DE MISSÕES',rewardReady:'Recompensa disponível',questPeriod:'Período das missões',claimed:'Resgatado',claimable:'Disponível',locked:'Bloqueado',stillLocked:'Ainda bloqueado',premiumRewardLocked:'Recompensa premium nível {level}, bloqueada',percentToNextLevel:'{percent}% até ao próximo nível',of:'de',xpUntilLevel:'XP até ao nível {level}',closeProfile:'Fechar perfil',profileSections:'Secções do perfil',achievementScore:'Pontos de conquistas',seasonLevelShort:'Nível da temporada {level}',masteryLevel:'Maestria {level}',masteryComputeBonus:'{xp} XP · +{percent}% de computação',seasonArtifacts:'Artefactos da temporada',activeChallenge:'Ativo: {name}',challengeGoalInt:'Objetivo: 1 INT sob a regra especial.',clears:'Conclusões {count}',bestMinutes:'Melhor {minutes} min',open:'Pendente',completed:'concluída',seasonHistoryStatus:'{level}/{max} níveis · {status}'};
const it:Partial<Record<Key,string>>={profile:'Profilo',collection:'Collezione',challenges:'Sfide',seasons:'Stagioni',stats:'Statistiche',inbox:'Messaggi',settings:'Impostazioni',language:'Lingua',numberFormat:'Formato numeri',daily:'Giornaliero',weekly:'Settimanale',monthly:'Mensile',quests:'Missioni',claim:'Riscatta',running:'In corso',workshop:'Officina',research:'Ricerca',inventory:'Inventario',prestige:'Prestigio',missions:'Missioni',seasonLevel:'Stagione 01 · Livello {level}/{max}',free:'Gratis',premiumInactive:'Premium · non attivo',rewardTrack:'Percorso ricompense',premiumChest:'Cassa premium',passInactive:'Pass non attivo',missionConsole:'CONSOLE MISSIONI',rewardReady:'Ricompensa disponibile',questPeriod:'Periodo missioni',claimed:'Riscattato',claimable:'Disponibile',locked:'Bloccato',stillLocked:'Ancora bloccato',premiumRewardLocked:'Ricompensa premium livello {level}, bloccata',percentToNextLevel:'{percent}% al prossimo livello',of:'di',xpUntilLevel:'XP fino al livello {level}',closeProfile:'Chiudi profilo',profileSections:'Sezioni del profilo',achievementScore:'Punti obiettivi',seasonLevelShort:'Livello stagione {level}',masteryLevel:'Maestria {level}',masteryComputeBonus:'{xp} XP · +{percent}% calcolo',seasonArtifacts:'Artefatti stagionali',activeChallenge:'Attiva: {name}',challengeGoalInt:'Obiettivo: 1 INT con la regola speciale.',clears:'Completamenti {count}',bestMinutes:'Migliore {minutes} min',open:'Aperto',completed:'completata',seasonHistoryStatus:'{level}/{max} livelli · {status}'};
const pl:Partial<Record<Key,string>>={profile:'Profil',collection:'Kolekcja',challenges:'Wyzwania',seasons:'Sezony',stats:'Statystyki',inbox:'Wiadomości',settings:'Ustawienia',language:'Język',numberFormat:'Format liczb',daily:'Dzienne',weekly:'Tygodniowe',monthly:'Miesięczne',quests:'Misje',claim:'Odbierz',running:'W toku',workshop:'Warsztat',research:'Badania',inventory:'Ekwipunek',prestige:'Prestiż',missions:'Misje',seasonLevel:'Sezon 01 · Poziom {level}/{max}',free:'Bezpłatne',premiumInactive:'Premium · nieaktywny',rewardTrack:'Ścieżka nagród',premiumChest:'Skrzynia premium',passInactive:'Karnet nieaktywny',missionConsole:'KONSOLA MISJI',rewardReady:'Nagroda gotowa',questPeriod:'Okres misji',claimed:'Odebrano',claimable:'Do odebrania',locked:'Zablokowane',stillLocked:'Nadal zablokowane',premiumRewardLocked:'Nagroda premium poziomu {level}, zablokowana',percentToNextLevel:'{percent}% do następnego poziomu',of:'z',xpUntilLevel:'XP do poziomu {level}',closeProfile:'Zamknij profil',profileSections:'Sekcje profilu',achievementScore:'Punkty osiągnięć',seasonLevelShort:'Poziom sezonu {level}',masteryLevel:'Mistrzostwo {level}',masteryComputeBonus:'{xp} XP · +{percent}% mocy obliczeniowej',seasonArtifacts:'Artefakty sezonowe',activeChallenge:'Aktywne: {name}',challengeGoalInt:'Cel: 1 INT na zasadach specjalnych.',clears:'Ukończenia {count}',bestMinutes:'Najlepszy {minutes} min',open:'Otwarte',completed:'ukończony',seasonHistoryStatus:'{level}/{max} poziomów · {status}'};
const dictionaries={en,de,es,fr,pt,it,pl};

export type TranslationParams=Record<string,string|number>;

export const t=(
  language:Language,
  key:Key,
  params:TranslationParams={}
)=>{
  const template=dictionaries[language][key]??en[key];
  return Object.entries(params).reduce(
    (text,[name,value])=>text.replaceAll(`{${name}}`,String(value)),
    template
  );
};
export const localeFor=(language:Language)=>({en:'en-US',de:'de-DE',es:'es-ES',fr:'fr-FR',pt:'pt-PT',it:'it-IT',pl:'pl-PL'} as const)[language];
export function formatLocalized(value:number,language:Language,format:NumberFormat='auto',digits=0){if(!Number.isFinite(value))return '∞';if(format==='scientific'||(format==='auto'&&Math.abs(value)>=1e15))return value.toExponential(Math.max(0,Math.min(3,digits||2)));if(format==='engineering'&&value!==0){const e=Math.floor(Math.log10(Math.abs(value))/3)*3;return `${(value/10**e).toLocaleString(localeFor(language),{maximumFractionDigits:2})}e${e}`;}return value.toLocaleString(localeFor(language),{maximumFractionDigits:digits});}

export type HardwareTranslationId=
  |'calculator'|'sbc'|'pc'|'gpu'|'rig'
  |'server'|'farm'|'campus'|'cloud'|'liquid'
  |'subsea'|'orbital'|'lunar'|'dyson'|'matrioshka';

type HardwareTranslation={
  name:string;
  description:string;
};

const hardwareTranslations:Record<HardwareTranslationId,Record<Language,HardwareTranslation>>={
  calculator:{
    en:{name:'Calculator',description:'A humble start for the first local AI.'},
    de:{name:'Taschenrechner',description:'Bescheidener Start für die erste lokale KI.'},
    es:{name:'Calculadora',description:'Un comienzo modesto para la primera IA local.'},
    fr:{name:'Calculatrice',description:'Un début modeste pour la première IA locale.'},
    pt:{name:'Calculadora',description:'Um começo modesto para a primeira IA local.'},
    it:{name:'Calcolatrice',description:'Un inizio modesto per la prima IA locale.'},
    pl:{name:'Kalkulator',description:'Skromny początek dla pierwszej lokalnej SI.'}
  },
  sbc:{
    en:{name:'Single-Board Computer',description:'Compact parallel processing in miniature form.'},
    de:{name:'Einplatinencomputer',description:'Kompakte Parallelverarbeitung im Miniaturformat.'},
    es:{name:'Ordenador de placa única',description:'Procesamiento paralelo compacto en formato miniatura.'},
    fr:{name:'Ordinateur monocarte',description:'Traitement parallèle compact au format miniature.'},
    pt:{name:'Computador de placa única',description:'Processamento paralelo compacto em formato miniatura.'},
    it:{name:'Computer a scheda singola',description:'Elaborazione parallela compatta in formato miniaturizzato.'},
    pl:{name:'Komputer jednopłytkowy',description:'Kompaktowe przetwarzanie równoległe w miniaturowej formie.'}
  },
  pc:{
    en:{name:'Home PC',description:'More cores for serious models.'},
    de:{name:'Heim-PC',description:'Mehr Kerne für ernsthafte Modelle.'},
    es:{name:'PC doméstico',description:'Más núcleos para modelos más exigentes.'},
    fr:{name:'PC domestique',description:'Plus de cœurs pour des modèles plus exigeants.'},
    pt:{name:'PC doméstico',description:'Mais núcleos para modelos mais exigentes.'},
    it:{name:'PC domestico',description:'Più core per modelli più impegnativi.'},
    pl:{name:'Komputer domowy',description:'Więcej rdzeni dla bardziej wymagających modeli.'}
  },
  gpu:{
    en:{name:'Gaming GPU',description:'Active impulses and parallel inference.'},
    de:{name:'Gaming-GPU',description:'Aktive Impulse und parallele Inferenz.'},
    es:{name:'GPU gaming',description:'Impulsos activos e inferencia paralela.'},
    fr:{name:'GPU gaming',description:'Impulsions actives et inférence parallèle.'},
    pt:{name:'GPU gaming',description:'Impulsos ativos e inferência paralela.'},
    it:{name:'GPU gaming',description:'Impulsi attivi e inferenza parallela.'},
    pl:{name:'GPU gamingowe',description:'Aktywne impulsy i równoległe wnioskowanie.'}
  },
  rig:{
    en:{name:'AI Workstation',description:'Accelerates selected training runs.'},
    de:{name:'KI-Workstation',description:'Beschleunigt gewählte Trainingsläufe.'},
    es:{name:'Estación de trabajo de IA',description:'Acelera los entrenamientos seleccionados.'},
    fr:{name:'Station de travail IA',description:'Accélère les entraînements sélectionnés.'},
    pt:{name:'Estação de trabalho de IA',description:'Acelera os treinos selecionados.'},
    it:{name:'Workstation IA',description:'Accelera gli addestramenti selezionati.'},
    pl:{name:'Stacja robocza SI',description:'Przyspiesza wybrane procesy treningowe.'}
  },
  server:{
    en:{name:'Server Rack',description:'A stable foundation for automation.'},
    de:{name:'Server-Rack',description:'Stabile Basis für Automation.'},
    es:{name:'Rack de servidores',description:'Una base estable para la automatización.'},
    fr:{name:'Baie de serveurs',description:"Une base stable pour l'automatisation."},
    pt:{name:'Rack de servidores',description:'Uma base estável para automação.'},
    it:{name:'Rack server',description:"Una base stabile per l'automazione."},
    pl:{name:'Szafa serwerowa',description:'Stabilna podstawa automatyzacji.'}
  },
  farm:{
    en:{name:'GPU Farm',description:'Concentrated raw compute production.'},
    de:{name:'GPU-Farm',description:'Gebündelte rohe Compute-Produktion.'},
    es:{name:'Granja de GPU',description:'Producción concentrada de potencia de cómputo.'},
    fr:{name:'Ferme de GPU',description:'Production concentrée de puissance de calcul.'},
    pt:{name:'Fazenda de GPU',description:'Produção concentrada de poder computacional.'},
    it:{name:'GPU Farm',description:'Produzione concentrata di potenza di calcolo.'},
    pl:{name:'Farma GPU',description:'Skoncentrowana produkcja mocy obliczeniowej.'}
  },
  campus:{
    en:{name:'Modular Data Center Campus',description:'Connects the early hardware classes.'},
    de:{name:'Modularer Rechenzentrumscampus',description:'Verbindet frühe Hardwareklassen.'},
    es:{name:'Campus modular de centros de datos',description:'Conecta las primeras clases de hardware.'},
    fr:{name:'Campus modulaire de centres de données',description:'Relie les premières classes de matériel.'},
    pt:{name:'Campus modular de centros de dados',description:'Liga as primeiras classes de hardware.'},
    it:{name:'Campus modulare di data center',description:'Collega le prime classi hardware.'},
    pl:{name:'Modułowy kampus centrów danych',description:'Łączy wczesne klasy sprzętu.'}
  },
  cloud:{
    en:{name:'Hyperscale Cloud',description:'Scales user capacity.'},
    de:{name:'Hyperscale-Cloud',description:'Skaliert die Nutzerkapazität.'},
    es:{name:'Nube hiperescalable',description:'Escala la capacidad de usuarios.'},
    fr:{name:'Cloud hyperscale',description:'Augmente la capacité utilisateurs.'},
    pt:{name:'Cloud hiperescalável',description:'Aumenta a capacidade de utilizadores.'},
    it:{name:'Cloud hyperscale',description:'Aumenta la capacità utenti.'},
    pl:{name:'Chmura hiperskalowa',description:'Skaluje pojemność użytkowników.'}
  },
  liquid:{
    en:{name:'Liquid-Cooled Compute Facility',description:'Directs compute into training and research.'},
    de:{name:'Flüssigkeitsgekühlte Compute-Anlage',description:'Lenkt Compute in Training und Forschung.'},
    es:{name:'Instalación de cómputo refrigerada por líquido',description:'Dirige el cómputo al entrenamiento y la investigación.'},
    fr:{name:'Installation de calcul refroidie par liquide',description:"Dirige la puissance de calcul vers l'entraînement et la recherche."},
    pt:{name:'Instalação computacional refrigerada a líquido',description:'Direciona computação para treino e pesquisa.'},
    it:{name:'Impianto di calcolo a liquido',description:"Dirige la potenza di calcolo verso l'addestramento e la ricerca."},
    pl:{name:'Centrum obliczeniowe chłodzone cieczą',description:'Kieruje moc obliczeniową do treningu i badań.'}
  },
  subsea:{
    en:{name:'Subsea Data Center',description:'Improves later offline systems.'},
    de:{name:'Untersee-Rechenzentrum',description:'Verbessert spätere Offline-Systeme.'},
    es:{name:'Centro de datos submarino',description:'Mejora los sistemas offline posteriores.'},
    fr:{name:'Centre de données sous-marin',description:'Améliore les systèmes hors ligne avancés.'},
    pt:{name:'Centro de dados submarino',description:'Melhora os sistemas offline avançados.'},
    it:{name:'Data center sottomarino',description:'Migliora i sistemi offline avanzati.'},
    pl:{name:'Podmorskie centrum danych',description:'Ulepsza późniejsze systemy offline.'}
  },
  orbital:{
    en:{name:'Orbital Data Center',description:'Unlocks discovery research.'},
    de:{name:'Orbitales Rechenzentrum',description:'Öffnet Entdeckungsforschung.'},
    es:{name:'Centro de datos orbital',description:'Desbloquea la investigación de descubrimiento.'},
    fr:{name:'Centre de données orbital',description:'Débloque la recherche de découverte.'},
    pt:{name:'Centro de dados orbital',description:'Desbloqueia pesquisa de descoberta.'},
    it:{name:'Data center orbitale',description:'Sblocca la ricerca di scoperta.'},
    pl:{name:'Orbitalne centrum danych',description:'Odblokowuje badania odkrywcze.'}
  },
  lunar:{
    en:{name:'Lunar AI Research Complex',description:'Provides access to late research branches.'},
    de:{name:'Lunarer KI-Forschungskomplex',description:'Zugang zu späten Forschungszweigen.'},
    es:{name:'Complejo lunar de investigación de IA',description:'Da acceso a ramas de investigación avanzadas.'},
    fr:{name:'Complexe lunaire de recherche IA',description:'Donne accès aux branches de recherche avancées.'},
    pt:{name:'Complexo lunar de pesquisa de IA',description:'Dá acesso a ramos de pesquisa avançados.'},
    it:{name:'Complesso lunare di ricerca IA',description:'Dà accesso ai rami di ricerca avanzati.'},
    pl:{name:'Księżycowy kompleks badawczy SI',description:'Zapewnia dostęp do zaawansowanych gałęzi badań.'}
  },
  dyson:{
    en:{name:'Fusion-Powered Dyson Swarm',description:'Specialized endgame production.'},
    de:{name:'Fusionsbetriebener Dyson-Schwarm',description:'Spezialisierte Endgame-Produktion.'},
    es:{name:'Enjambre Dyson de fusión',description:'Producción especializada para el final del juego.'},
    fr:{name:'Essaim de Dyson à fusion',description:'Production spécialisée de fin de jeu.'},
    pt:{name:'Enxame de Dyson a fusão',description:'Produção especializada de fim de jogo.'},
    it:{name:'Sciame di Dyson a fusione',description:'Produzione specializzata da endgame.'},
    pl:{name:'Rój Dysona zasilany fuzją',description:'Wyspecjalizowana produkcja końcowej fazy gry.'}
  },
  matrioshka:{
    en:{name:'Matrioshka Brain',description:'Prepares the later Axiom layer.'},
    de:{name:'Matrioshka-Gehirn',description:'Bereitet die spätere Axiom-Ebene vor.'},
    es:{name:'Cerebro Matrioshka',description:'Prepara la futura capa Axiom.'},
    fr:{name:'Cerveau Matrioshka',description:'Prépare la future couche Axiom.'},
    pt:{name:'Cérebro Matrioshka',description:'Prepara a futura camada Axiom.'},
    it:{name:'Cervello Matrioshka',description:'Prepara il futuro livello Axiom.'},
    pl:{name:'Mózg Matrioszka',description:'Przygotowuje późniejszą warstwę Axiom.'}
  }
};

export function hardwareText(id:HardwareTranslationId,language:Language){
  return hardwareTranslations[id][language]??hardwareTranslations[id].en;
}
