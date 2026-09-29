import type {Language} from './i18n';
import type {HardwareId,OperatingProfileId} from './economy';

type L=Record<Language,string>;

const l=(en:string,de:string,es:string,fr:string,pt:string,it:string,pl:string):L=>({en,de,es,fr,pt,it,pl});

export const workshopCopy={
  credits:l('Credits','Credits','Créditos','Crédits','Créditos','Crediti','Kredyty'),
  compute:l('Compute','Compute','Cómputo','Calcul','Computação','Calcolo','Moc obliczeniowa'),
  users:l('Users','Nutzer','Usuarios','Utilisateurs','Utilizadores','Utenti','Użytkownicy'),
  data:l('Data','Daten','Datos','Données','Dados','Dati','Dane'),

  scalingEngine:l('Scaling Engine','Skalierungs-Motor','Motor de escalado','Moteur de mise à l’échelle','Motor de escala','Motore di scalabilità','Silnik skalowania'),
  operatingProfile:l('Operating Profile','Betriebsprofil','Perfil operativo','Profil opérationnel','Perfil operacional','Profilo operativo','Profil operacyjny'),

  labImpulse:l('Lab Impulse','Labor-Impuls','Impulso de laboratorio','Impulsion du laboratoire','Impulso de laboratório','Impulso laboratorio','Impuls laboratoryjny'),
  tapOrHold:l('Tap or hold','Tippen oder halten','Toca o mantén pulsado','Touchez ou maintenez','Toca ou mantém premido','Tocca o tieni premuto','Dotknij lub przytrzymaj'),

  ready:l('ready','bereit','listo','prêt','pronto','pronto','gotowe'),
  activate:l('Activate','Aktivieren','Activar','Activer','Ativar','Attiva','Aktywuj'),
  selectedChannel:l('15 s ×2 selected channel · 90 s cooldown','15 s ×2 gewählter Kanal · Cooldown 90 s','15 s ×2 canal seleccionado · 90 s de recarga','15 s ×2 canal sélectionné · recharge 90 s','15 s ×2 canal selecionado · recarga 90 s','15 s ×2 canale selezionato · recupero 90 s','15 s ×2 wybrany kanał · 90 s odnowienia'),

  modelEquipment:l('AI Model Equipment','KI-Modell-Ausrüstung','Equipo del modelo de IA','Équipement du modèle IA','Equipamento do modelo de IA','Equipaggiamento modello IA','Wyposażenie modelu SI'),
  occupiedSlots:l('slots occupied · tap model','Sockel belegt · Modell antippen','ranuras ocupadas · toca el modelo','emplacements occupés · touchez le modèle','espaços ocupados · toca no modelo','slot occupati · tocca il modello','zajęte gniazda · dotknij modelu'),

  model:l('Model','Modell','Modelo','Modèle','Modelo','Modello','Model'),
  quality:l('Quality','Qualität','Calidad','Qualité','Qualidade','Qualità','Jakość'),
  efficiency:l('Efficiency','Effizienz','Eficiencia','Efficacité','Eficiência','Efficienza','Wydajność'),
  qualityEffect:l('+4% revenue per user','+4 % Umsatz pro Nutzer','+4 % ingresos por usuario','+4 % de revenu par utilisateur','+4 % receita por utilizador','+4 % ricavi per utente','+4% przychodu na użytkownika'),
  efficiencyEffect:l('−3% compute per user','−3 % Compute pro Nutzer','−3 % cómputo por usuario','−3 % de calcul par utilisateur','−3 % computação por utilizador','−3 % calcolo per utente','−3% mocy na użytkownika'),

  work:l('work','Arbeit','trabajo','travail','trabalho','lavoro','praca'),
  remaining:l('remaining','Restzeit','restante','restant','restante','rimanente','pozostało'),
  rate:l('rate','Rate','tasa','vitesse','taxa','velocità','tempo'),
  cost:l('cost','Kosten','coste','coût','custo','costo','koszt'),
  approx:l('approx.','ca.','aprox.','env.','aprox.','circa','ok.'),
  minutes:l('min.','Min.','min.','min.','min.','min.','min.'),
  trainQuality:l('Train Quality','Qualität trainieren','Entrenar calidad','Entraîner la qualité','Treinar qualidade','Addestra qualità','Trenuj jakość'),
  trainEfficiency:l('Train Efficiency','Effizienz trainieren','Entrenar eficiencia','Entraîner l’efficacité','Treinar eficiência','Addestra efficienza','Trenuj wydajność'),
  modelQuality:l('model quality','Modellqualität','calidad del modelo','qualité du modèle','qualidade do modelo','qualità del modello','jakość modelu'),
  moreUsers:l('therefore more users','dadurch mehr Nutzer','por tanto más usuarios','donc plus d’utilisateurs','logo mais utilizadores','quindi più utenti','czyli więcej użytkowników'),
  nextMilestone:l('next milestone','nächster Meilenstein','siguiente hito','prochain palier','próximo marco','prossimo traguardo','następny kamień milowy'),

  nextGoal:l('Next Goal','Nächstes Ziel','Siguiente objetivo','Prochain objectif','Próximo objetivo','Prossimo obiettivo','Następny cel'),
  reward:l('Reward','Belohnung','Recompensa','Récompense','Recompensa','Ricompensa','Nagroda'),
  collect:l('Claim','Abholen','Reclamar','Récupérer','Resgatar','Riscatta','Odbierz'),
  notReached:l('Not reached yet','Noch nicht erreicht','Aún no alcanzado','Pas encore atteint','Ainda não alcançado','Non ancora raggiunto','Jeszcze nie osiągnięto'),

  max:l('Max','Max','Máx.','Max','Máx.','Max','Maks.'),
  share:l('share','Anteil','proporción','part','parcela','quota','udział'),
  mastery:l('Mastery','Mastery','Maestría','Maîtrise','Maestria','Maestria','Mistrzostwo'),
  classCompute:l('class compute','Klassen-Compute','cómputo de clase','calcul de classe','computação da classe','calcolo di classe','moc klasy'),
  legacyAt500:l('from 500 units this class counts toward legacy infrastructure','ab 500 Stück zählt die Klasse für Legacy-Infrastruktur.','desde 500 unidades esta clase cuenta para la infraestructura heredada','à partir de 500 unités cette classe compte pour l’infrastructure héritée','a partir de 500 unidades esta classe conta para a infraestrutura legada','da 500 unità questa classe conta per l’infrastruttura legacy','od 500 sztuk klasa liczy się do infrastruktury legacy'),

  allMilestones:l('All six milestones reached','Alle sechs Meilensteine erreicht','Se alcanzaron los seis hitos','Les six paliers sont atteints','Todos os seis marcos alcançados','Tutti e sei i traguardi raggiunti','Osiągnięto wszystkie sześć kamieni milowych'),
  reached:l('Reached','Erreicht','Alcanzados','Atteints','Alcançados','Raggiunti','Osiągnięte'),
  noneYet:l('none yet','noch keiner','ninguno todavía','aucun','nenhum ainda','nessuno','jeszcze żaden'),

  buy:l('Buy','Kaufe','Comprar','Acheter','Comprar','Acquista','Kup'),
  affordableIn:l('affordable in','bezahlbar in','disponible en','abordable dans','disponível em','acquistabile tra','dostępne za'),
  paysBackIn:l('pays back in','amortisiert in','se amortiza en','amorti en','retorno em','si ripaga in','zwrot za'),

  autobuyer:l('Autobuyer','Autobuyer','Compra automática','Achat automatique','Compra automática','Acquisto automatico','Autokupowanie'),
  on:l('ON','AN','ACTIVO','ACTIF','ATIVO','ON','WŁ.'),
  off:l('OFF','AUS','INACTIVO','INACTIF','DESATIVADO','OFF','WYŁ.'),
  every:l('every','alle','cada','toutes les','a cada','ogni','co'),

  nextClass:l('Next class','Nächste Klasse','Siguiente clase','Classe suivante','Próxima classe','Classe successiva','Następna klasa'),
  previousUnits:l('units of the previous class','Einheiten der vorherigen Klasse','unidades de la clase anterior','unités de la classe précédente','unidades da classe anterior','unità della classe precedente','sztuk poprzedniej klasy'),

  oldHardware:l(
    'Old hardware still counts',
    'Alte Hardware zählt weiter',
    'El hardware antiguo sigue contando',
    'L’ancien matériel compte toujours',
    'O hardware antigo continua a contar',
    'Il vecchio hardware continua a contare',
    'Starszy sprzęt nadal się liczy'
  ),
  classes:l('classes at','Klassen bei','clases con','classes à','classes com','classi a','klas przy'),
  ownershipCredits:l('Ownership Credits','Besitz-Credits','Créditos de propiedad','Crédits de possession','Créditos de posse','Crediti di possesso','Kredyty posiadania')
} as const;

export type WorkshopCopyKey=keyof typeof workshopCopy;

export const wt=(language:Language,key:WorkshopCopyKey)=>workshopCopy[key][language];

/* Hardware milestone labels are generated from semantic roots + stages.
   BALANCE remains untouched and can keep its legacy German labels. */
const milestoneRoots:Record<HardwareId,L>={
  calculator:l('Tap','Tap','Toque','Tap','Toque','Tap','Tap'),
  sbc:l('Data','Daten','Datos','Données','Dados','Dati','Dane'),
  pc:l('Users','Nutzer','Usuarios','Utilisateurs','Utilizadores','Utenti','Użytkownicy'),
  gpu:l('Overclock','Overclock','Overclock','Overclock','Overclock','Overclock','Overclock'),
  rig:l('Training','Training','Entrenamiento','Entraînement','Treino','Addestramento','Trening'),
  server:l('Automation','Automation','Automatización','Automatisation','Automação','Automazione','Automatyzacja'),
  farm:l('Compute','Compute','Cómputo','Calcul','Computação','Calcolo','Moc'),
  campus:l('Synergy','Synergie','Sinergia','Synergie','Sinergia','Sinergia','Synergia'),
  cloud:l('Users','Nutzer','Usuarios','Utilisateurs','Utilizadores','Utenti','Użytkownicy'),
  liquid:l('Lab','Labor','Laboratorio','Laboratoire','Laboratório','Laboratorio','Laboratorium'),
  subsea:l('Offline','Offline','Offline','Hors ligne','Offline','Offline','Offline'),
  orbital:l('Discovery','Entdeckung','Descubrimiento','Découverte','Descoberta','Scoperta','Odkrycie'),
  lunar:l('Research','Forschung','Investigación','Recherche','Pesquisa','Ricerca','Badania'),
  dyson:l('Energy','Energie','Energía','Énergie','Energia','Energia','Energia'),
  matrioshka:l('Meta','Meta','Meta','Méta','Meta','Meta','Meta')
};

const milestoneStages:Record<number,L>={
  10:l('Impulse','Impuls','Impulso','Impulsion','Impulso','Impulso','Impuls'),
  25:l('Coupling','Kopplung','Acoplamiento','Couplage','Acoplamento','Accoppiamento','Sprzężenie'),
  50:l('Protocol','Protokoll','Protocolo','Protocole','Protocolo','Protocollo','Protokół'),
  100:l('Network','Netz','Red','Réseau','Rede','Rete','Sieć'),
  250:l('Matrix','Matrix','Matriz','Matrice','Matriz','Matrice','Macierz'),
  500:l('Singularity','Singularität','Singularidad','Singularité','Singularidade','Singolarità','Osobliwość')
};

export const hardwareMilestoneText=(id:HardwareId,threshold:number,language:Language)=>{
  const stage=milestoneStages[threshold];
  return stage
    ? `${milestoneRoots[id][language]} ${stage[language]}`
    : `${milestoneRoots[id][language]} ${threshold}`;
};

const profileNames:Record<OperatingProfileId,L>={
  balanced:l('Balanced','Ausgewogen','Equilibrado','Équilibré','Equilibrado','Bilanciato','Zrównoważony'),
  training:l('Training','Training','Entrenamiento','Entraînement','Treino','Addestramento','Trening'),
  discovery:l('Discovery','Entdeckung','Descubrimiento','Découverte','Descoberta','Scoperta','Odkrywanie')
};

export const operatingProfileText=(id:OperatingProfileId,language:Language)=>profileNames[id][language];

export type OnboardingId=
  |'first-buy'
  |'ten-calculators'
  |'discover-sbc'
  |'first-level'
  |'first-research'
  |'equip-item'
  |'class-upgrade'
  |'first-prestige';

type OnboardingCopy={title:L;text:L;reward:L};

const onboarding:Record<OnboardingId,OnboardingCopy>={
  'first-buy':{
    title:l('First Expansion','Erste Erweiterung','Primera expansión','Première extension','Primeira expansão','Prima espansione','Pierwsza rozbudowa'),
    text:l('Buy your first hardware.','Kaufe deine erste Hardware.','Compra tu primer hardware.','Achetez votre premier matériel.','Compra o teu primeiro hardware.','Acquista il tuo primo hardware.','Kup swój pierwszy sprzęt.'),
    reward:l('25 Credits','25 Credits','25 créditos','25 crédits','25 créditos','25 crediti','25 kredytów')
  },
  'ten-calculators':{
    title:l('Compute Collective','Rechenkollektiv','Colectivo de cálculo','Collectif de calcul','Coletivo computacional','Collettivo di calcolo','Kolektyw obliczeniowy'),
    text:l('Own 10 calculators.','Besitze 10 Taschenrechner.','Posee 10 calculadoras.','Possédez 10 calculatrices.','Possui 10 calculadoras.','Possiedi 10 calcolatrici.','Posiadaj 10 kalkulatorów.'),
    reward:l('60 Credits','60 Credits','60 créditos','60 crédits','60 créditos','60 crediti','60 kredytów')
  },
  'discover-sbc':{
    title:l('New Architecture','Neue Architektur','Nueva arquitectura','Nouvelle architecture','Nova arquitetura','Nuova architettura','Nowa architektura'),
    text:l('Discover the Single-Board Computer.','Entdecke den Einplatinencomputer.','Descubre el ordenador de placa única.','Découvrez l’ordinateur monocarte.','Descobre o computador de placa única.','Scopri il computer a scheda singola.','Odkryj komputer jednopłytkowy.'),
    reward:l('120 Credits','120 Credits','120 créditos','120 crédits','120 créditos','120 crediti','120 kredytów')
  },
  'first-level':{
    title:l('Learning Model','Lernendes Modell','Modelo de aprendizaje','Modèle apprenant','Modelo em aprendizagem','Modello in apprendimento','Uczący się model'),
    text:l('Reach model level 1.','Erreiche Modelllevel 1.','Alcanza el nivel de modelo 1.','Atteignez le niveau de modèle 1.','Alcança o nível 1 do modelo.','Raggiungi il livello modello 1.','Osiągnij 1. poziom modelu.'),
    reward:l('100 Credits','100 Credits','100 créditos','100 crédits','100 créditos','100 crediti','100 kredytów')
  },
  'first-research':{
    title:l('Research Begins','Forschung beginnt','Comienza la investigación','La recherche commence','A pesquisa começa','Inizia la ricerca','Początek badań'),
    text:l('Complete your first research project.','Schließe dein erstes Forschungsprojekt ab.','Completa tu primer proyecto de investigación.','Terminez votre premier projet de recherche.','Conclui o teu primeiro projeto de pesquisa.','Completa il tuo primo progetto di ricerca.','Ukończ pierwszy projekt badawczy.'),
    reward:l('100 Credits','100 Credits','100 créditos','100 crédits','100 créditos','100 crediti','100 kredytów')
  },
  'equip-item':{
    title:l('Equip the Lab','Labor ausrüsten','Equipar el laboratorio','Équiper le laboratoire','Equipar o laboratório','Equipaggia il laboratorio','Wyposaż laboratorium'),
    text:l('Equip an item.','Rüste ein Item aus.','Equipa un objeto.','Équipez un objet.','Equipa um item.','Equipaggia un oggetto.','Wyposaż przedmiot.'),
    reward:l('75 Components','75 Komponenten','75 componentes','75 composants','75 componentes','75 componenti','75 komponentów')
  },
  'class-upgrade':{
    title:l('Specialized Hardware','Spezialisierte Hardware','Hardware especializado','Matériel spécialisé','Hardware especializado','Hardware specializzato','Wyspecjalizowany sprzęt'),
    text:l('Buy a class upgrade.','Kaufe ein Klassen-Upgrade.','Compra una mejora de clase.','Achetez une amélioration de classe.','Compra uma melhoria de classe.','Acquista un potenziamento di classe.','Kup ulepszenie klasy.'),
    reward:l('250 Credits','250 Credits','250 créditos','250 crédits','250 créditos','250 crediti','250 kredytów')
  },
  'first-prestige':{
    title:l('Restart the Lab','Neustart des Labors','Reiniciar el laboratorio','Redémarrer le laboratoire','Reiniciar o laboratório','Riavvia il laboratorio','Restart laboratorium'),
    text:l('Perform your first prestige.','Führe den ersten Prestige durch.','Realiza tu primer prestigio.','Effectuez votre premier prestige.','Realiza o teu primeiro prestígio.','Esegui il tuo primo prestigio.','Wykonaj pierwszy prestiż.'),
    reward:l('Completed','Abgeschlossen','Completado','Terminé','Concluído','Completato','Ukończono')
  }
};

export const onboardingText=(id:string,language:Language)=>{
  const copy=onboarding[id as OnboardingId];
  if(!copy)return null;
  return {
    title:copy.title[language],
    text:copy.text[language],
    reward:copy.reward[language]
  };
};
