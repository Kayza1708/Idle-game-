using System;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 // Persistent controls: progress, prices and stock update without recreating the hierarchy.
 public sealed class AnalysisOverview:MonoBehaviour
 {
  RectTransform progress;GameRuntime game;Text title,status,limit,receipt;Button cancel,repeat,recipe;readonly Button[] starts=new Button[ItemBalance.Analyses.Length],queued=new Button[(int)IndustryBalance.AnalysisQueueCapacity];readonly Text[] yields=new Text[ItemBalance.Analyses.Length/2];readonly Text[] received=new Text[ItemBalance.ComponentIds.Length];GameState observed;
  static void Set(Text text,string value){if(text.text!=value)text.text=value;}
  static string W(string lang,params string[] text){int n=Array.IndexOf(new[]{"de","en","es","fr","pt","it","pl"},lang);return text[Math.Max(0,n)];}
  string T(params string[] text)=>W(game.State.Settings.language,text);
  public void Initialize(WorkshopUI owner,GameRuntime runtime)
  {
   game=runtime;title=WorkshopUIFactory.Label("AnalysisTitle",transform,"",18,30);
   status=WorkshopUIFactory.Label("AnalysisStatus",transform,"",14,52);
   var rail=WorkshopUIFactory.Node("AnalysisProgress",transform,typeof(Image));rail.GetComponent<Image>().color=GameTheme.Raised;rail.GetComponent<Image>().raycastTarget=false;WorkshopUIFactory.Size(rail,6);var fill=WorkshopUIFactory.Node("Fill",rail.transform,typeof(Image));fill.GetComponent<Image>().color=GameTheme.Accent;fill.GetComponent<Image>().raycastTarget=false;progress=(RectTransform)fill.transform;WorkshopUIFactory.Fill(progress);
   cancel=WorkshopUIFactory.Button("CancelAnalysis",transform,"",()=>Run(MaterialAnalysis.Cancel));
   for(int family=0;family<yields.Length;family++)
   {
    int f=family;var card=WorkshopUIFactory.Vertical("AnalysisFamily"+family,transform);var header=WorkshopUIFactory.Horizontal("Heading",card.transform,44);
    var art=WorkshopUIFactory.Node("Art",header.transform,typeof(Image),typeof(LayoutElement));art.GetComponent<Image>().sprite=owner.ComponentSprites[new[]{0,2,9}[family]];art.GetComponent<Image>().preserveAspect=true;art.GetComponent<Image>().raycastTarget=false;var size=art.GetComponent<LayoutElement>();size.minWidth=size.preferredWidth=36;size.flexibleWidth=0;
    yields[family]=WorkshopUIFactory.Label("AnalysisYield"+family,header.transform,"",13,44);
    var actions=WorkshopUIFactory.Horizontal("Durations",card.transform,54);
    for(int length=0;length<2;length++){int n=f*2+length;starts[n]=WorkshopUIFactory.Button("analysis-"+ItemBalance.Analyses[n].Id,actions.transform,"",()=>{Run(v=>v.Workshop.hasAnalysis||v.Industry.synthesis!=null?MaterialAnalysis.Queue(v,n):MaterialAnalysis.Start(v,n));});starts[n].GetComponentInChildren<Text>().fontSize=12;GameTheme.ButtonStyle(starts[n],true);}
   }
   repeat=WorkshopUIFactory.Button("AnalysisRepeat",transform,"",()=>Run(MaterialAnalysis.ToggleRepeat));
   recipe=WorkshopUIFactory.Button("AnalysisRepeatRecipe",transform,"",()=>Run(v=>{if(!MaterialAnalysis.RepeatUnlocked(v))return v;var n=v.Copy();do{n.Meta.analysisRecipe=(n.Meta.analysisRecipe+1)%ItemBalance.Analyses.Length;}while(!MaterialAnalysis.RecipeAccess(n,n.Meta.analysisRecipe));n.Workshop.revision++;return n;}));
   for(int q=0;q<queued.Length;q++){int index=q;queued[q]=WorkshopUIFactory.Button("AnalysisQueue"+q,transform,"",()=>Run(v=>MaterialAnalysis.RemoveQueued(v,index)));queued[q].GetComponentInChildren<Text>().fontSize=12;}
   limit=WorkshopUIFactory.Label("AnalysisOfflineLimit",transform,"",12,52);
   receipt=WorkshopUIFactory.Label("AnalysisReceipt",transform,"",14,30);
   var stock=WorkshopUIFactory.Node("AnalysisReceiptGrid",transform,typeof(GridLayoutGroup),typeof(LayoutElement));var grid=stock.GetComponent<GridLayoutGroup>();grid.constraint=GridLayoutGroup.Constraint.FixedColumnCount;grid.constraintCount=5;grid.cellSize=new Vector2(48,52);grid.spacing=new Vector2(6,4);grid.childAlignment=TextAnchor.UpperCenter;
   for(int c=0;c<received.Length;c++){var cell=WorkshopUIFactory.Node("AnalysisFound"+c,stock.transform);var icon=WorkshopUIFactory.Node("Art",cell.transform,typeof(Image)).GetComponent<Image>();icon.sprite=owner.ComponentSprites[c];icon.preserveAspect=true;icon.raycastTarget=false;icon.rectTransform.anchorMin=new Vector2(0,0.4f);icon.rectTransform.anchorMax=Vector2.one;icon.rectTransform.offsetMin=icon.rectTransform.offsetMax=Vector2.zero;received[c]=WorkshopUIFactory.Label("Amount",cell.transform,"",12,20);DestroyImmediate(received[c].GetComponent<LayoutElement>());received[c].alignment=TextAnchor.LowerCenter;WorkshopUIFactory.Fill(received[c].rectTransform);}
   Refresh();
  }
  void Run(Func<GameState,GameState> action){game.Act(action);Refresh();}
  void Update()=>Refresh();
  public void Refresh()
  {
   if(game?.State==null||ReferenceEquals(observed,game.State))return;observed=game.State;var s=game.State;var w=s.Workshop;string lang=s.Settings.language;string[] names={T("Hardwareanalyse","Hardware analysis","Análisis de hardware","Analyse matérielle","Análise de hardware","Analisi hardware","Analiza sprzętu"),T("Architekturstudie","Architecture study","Estudio de arquitectura","Étude d’architecture","Estudo de arquitetura","Studio di architettura","Badanie architektury"),T("Artefaktsuche","Artifact search","Búsqueda de artefactos","Recherche d’artefacts","Busca de artefatos","Ricerca artefatti","Poszukiwanie artefaktów")};
   string Name(int n)=>names[n/2]+" · "+(n%2==0?T("Kurz","Short","Corto","Courte","Curta","Breve","Krótka"):T("Lang","Long","Largo","Longue","Longa","Lunga","Długa"));
   string Number(double n)=>NumberFormatting.Format(ScientificNumber.From(n),s.Settings.numberFormat);
   string Time(double seconds)=>seconds<3600?Math.Ceiling(seconds/60)+" min":(seconds/3600).ToString("0.#")+" h";
   Set(title,T("Materialanalyse","Material analysis","Análisis de materiales","Analyse de matériaux","Análise de materiais","Analisi materiali","Analiza materiałów"));
   Set(status,w.hasAnalysis?Name(w.analysis.definition)+" · "+Math.Floor(w.analysis.done/w.analysis.required*100)+" %\n"+Time(Math.Max(0,w.analysis.required-w.analysis.done)/MaterialAnalysis.Speed(s))+" · "+Number(w.analysis.units)+" "+UiLocalizedText.Translate("Komponenten",lang):s.Industry.synthesis!=null?UiLocalizedText.Translate("Synthese",lang)+" · "+Math.Floor(s.Industry.synthesis.done/s.Industry.synthesis.required*100)+" %":T("Analyseplatz frei","Analysis slot available","Análisis disponible","Analyse disponible","Análise disponível","Analisi disponibile","Analiza dostępna"));
   progress.parent.gameObject.SetActive(w.hasAnalysis||s.Industry.synthesis!=null);float value=w.hasAnalysis?(float)(w.analysis.done/w.analysis.required):s.Industry.synthesis!=null?(float)(s.Industry.synthesis.done/s.Industry.synthesis.required):0;var anchor=new Vector2(Mathf.Clamp01(value),1);if(progress.anchorMax!=anchor)progress.anchorMax=anchor;
   cancel.gameObject.SetActive(w.hasAnalysis);Set(cancel.GetComponentInChildren<Text>(),T("Abbrechen · keine Erstattung","Cancel · no refund","Cancelar · sin reembolso","Annuler · sans remboursement","Cancelar · sem reembolso","Annulla · nessun rimborso","Anuluj · bez zwrotu"));cancel.interactable=game.Writable;
   for(int f=0;f<yields.Length;f++){Set(yields[f],names[f]+(!MaterialAnalysis.RecipeAccess(s,f*2)?" · "+UiLocalizedText.Translate(f==1?"Baupläne":"Bauplananalyse Lv. 3",lang):"")+"\n"+Number(MaterialAnalysis.Units(s,f*2))+" / "+Number(MaterialAnalysis.Units(s,f*2+1))+" "+UiLocalizedText.Translate("Komponenten",lang));for(int l=0;l<2;l++){int n=f*2+l;var d=ItemBalance.Analyses[n];bool busy=w.hasAnalysis||s.Industry.synthesis!=null;string action=busy?T("Einreihen","Queue","Encolar","Planifier","Enfileirar","Accoda","Kolejkuj"):T("Starten","Start","Iniciar","Lancer","Iniciar","Avvia","Rozpocznij");Set(starts[n].GetComponentInChildren<Text>(),Time(d.Work/MaterialAnalysis.Speed(s))+" · "+Number(Industry.AnalysisCost(s,d.Cost))+" "+SettingsRules.Text(lang,"game:data")+"\n"+action);starts[n].interactable=game.Writable&&MaterialAnalysis.RecipeAccess(s,n)&&(busy?PrestigeRules.Has(s,"F02")&&s.Industry.analysisQueue.Length<IndustryBalance.AnalysisQueueCapacity:MaterialAnalysis.Block(s,n)==null);}}
   bool unlocked=MaterialAnalysis.RepeatUnlocked(s);Set(repeat.GetComponentInChildren<Text>(),unlocked?T("Wiederholen","Repeat","Repetir","Répéter","Repetir","Ripeti","Powtarzaj")+": "+(s.Meta.analysisAuto?"ON":"OFF"):UiLocalizedText.Translate(PrestigeBalance.Nodes.First(n=>n.Id=="F03").Name,lang)+" · "+Number(PrestigeBalance.Nodes.First(n=>n.Id=="F03").Cost)+" INT");repeat.interactable=game.Writable&&unlocked;recipe.gameObject.SetActive(unlocked);Set(recipe.GetComponentInChildren<Text>(),Name(s.Meta.analysisRecipe)+" ↻");recipe.interactable=game.Writable;
   for(int n=0;n<queued.Length;n++){bool visible=n<s.Industry.analysisQueue.Length;queued[n].gameObject.SetActive(visible);if(visible)Set(queued[n].GetComponentInChildren<Text>(),(n+1)+". "+Name(s.Industry.analysisQueue[n])+" · ×");queued[n].interactable=game.Writable;}
   Set(limit,(PrestigeRules.Has(s,"F02")?s.Industry.analysisQueue.Length+" / "+IndustryBalance.AnalysisQueueCapacity:UiLocalizedText.Translate(PrestigeBalance.Nodes.First(n=>n.Id=="F02").Name,lang)+" · "+Number(PrestigeBalance.Nodes.First(n=>n.Id=="F02").Cost)+" INT")+" · "+T("Offline","Offline","Sin conexión","Hors ligne","Offline","Offline","Offline")+" ≤ "+Time(Game.OfflineLimit(s))+"\n"+T("Zufällige Funde · Daten beim Start","Random finds · data paid on start","Hallazgos aleatorios · pago al iniciar","Trouvailles aléatoires · paiement au départ","Achados aleatórios · pago no início","Ritrovamenti casuali · pagamento all’avvio","Losowe znaleziska · płatność na starcie"));
   bool hasReceipt=s.Industry.lastAnalysisRecipe>=0;receipt.gameObject.SetActive(hasReceipt);Set(receipt,T("Letzter Fund","Last findings","Último hallazgo","Dernière découverte","Último achado","Ultimo ritrovamento","Ostatnie znaleziska"));int count=0;for(int c=0;c<received.Length;c++){long amount=s.Industry.lastAnalysisAmounts[c];bool visible=hasReceipt&&amount>0;received[c].transform.parent.gameObject.SetActive(visible);if(visible){count++;Set(received[c],"+"+Number(amount));}}var box=received[0].transform.parent.parent;box.gameObject.SetActive(count>0);var size=box.GetComponent<LayoutElement>();float height=(float)Math.Ceiling(count/5d)*56;if(size.preferredHeight!=height)size.minHeight=size.preferredHeight=height;
  }
 }
}
