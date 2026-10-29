using System;using System.Linq;using IdleIntelligence.Core;using UnityEngine;
namespace IdleIntelligence.Runtime {
 // Stable original-art lab cards: one allocation when capacity changes, cached
 // names and quantized time text, progress alone updates during regular ticks.
 public sealed class ResearchLabOverview:MonoBehaviour {
  public Transform QueueAnchor{get;private set;}
  float next;GameRuntime game;int count=-1;UnityEngine.UI.Text heading;Transform slots;
  UnityEngine.UI.Text[] status,metadata,time;UnityEngine.UI.Image[] progress,icons;string[] keys;
  UnityEngine.UI.Button[] groups;ActionCard[] cards;int area;
  public void Bind(ActionCard[] entries,int selected){cards=entries;var tabs=WorkshopUIFactory.Node("ResearchAreas",transform,typeof(UnityEngine.UI.GridLayoutGroup),typeof(ItemGrid));WorkshopUIFactory.Size(tabs,92);var grid=tabs.GetComponent<UnityEngine.UI.GridLayoutGroup>();grid.constraint=UnityEngine.UI.GridLayoutGroup.Constraint.FixedColumnCount;grid.constraintCount=3;grid.spacing=new Vector2(4,4);tabs.GetComponent<ItemGrid>().Height=44;groups=new UnityEngine.UI.Button[5];for(int i=0;i<5;i++){int a=i;groups[i]=WorkshopUIFactory.Button("ResearchArea"+i,tabs.transform,"",()=>game.SetResearchArea(a));GameTheme.CompactAction(groups[i],false);}ShowArea(selected);}
  public void ShowArea(int selected){area=selected;if(cards==null)return;for(int i=0;i<cards.Length;i++)cards[i].gameObject.SetActive(Workshop.ResearchArea(Balance.Research[i].Id)==area);for(int i=0;i<groups.Length;i++){groups[i].GetComponentInChildren<UnityEngine.UI.Text>().text=UiLocalizedText.Translate(new[]{"Daten","Hardware","Modelle","Material","Automation"}[i],game.State.Settings.language);groups[i].GetComponentInChildren<UnityEngine.UI.Text>().color=i==area?GameTheme.Accent:GameTheme.Muted;groups[i].GetComponent<UnityEngine.UI.Image>().color=i==area?GameTheme.Hex("17353F"):Color.clear;}}

  public void Initialize(GameRuntime runtime){
   game=runtime;heading=WorkshopUIFactory.Label("ResearchHeading",transform,"",18,30);heading.font=GameTheme.Bold;
   slots=WorkshopUIFactory.Node("LaboratorySlots",transform,typeof(UnityEngine.UI.GridLayoutGroup),typeof(ItemGrid),typeof(UnityEngine.UI.LayoutElement)).transform;
   var grid=slots.GetComponent<UnityEngine.UI.GridLayoutGroup>();grid.constraint=UnityEngine.UI.GridLayoutGroup.Constraint.FixedColumnCount;grid.constraintCount=2;grid.spacing=new Vector2(5,5);slots.GetComponent<ItemGrid>().Height=94;
   QueueAnchor=WorkshopUIFactory.Vertical("PlannedResearch",transform).transform;Refresh();
  }
  void Update(){if(game!=null&&Time.unscaledTime>=next){next=Time.unscaledTime+.1f;Refresh();}}
  void Refresh(){
   var state=game.State;string language=state.Settings.language;var jobs=PrestigeAutomation.ResearchJobs(state).ToArray();int capacity=PrestigeAutomation.LabCount(state);
   int retained=jobs.Count(j=>j.slot>=capacity);string title=NativeCopy.Text("Forschung",language)+" · "+jobs.Count(j=>j.slot<capacity)+" / "+capacity+" "+NativeCopy.Text("belegt",language)+(retained>0?" · "+retained+" "+NativeCopy.Text("Abschluss",language):"");if(heading.text!=title)heading.text=title;
   int visible=Math.Max(capacity,jobs.Select(j=>j.slot+1).DefaultIfEmpty(0).Max());
   if(count!=visible){
    count=visible;WorkshopUIFactory.Clear(slots);status=new UnityEngine.UI.Text[count];metadata=new UnityEngine.UI.Text[count];time=new UnityEngine.UI.Text[count];progress=new UnityEngine.UI.Image[count];icons=new UnityEngine.UI.Image[count];keys=new string[count];
    int rows=(count+1)/2;var size=slots.GetComponent<UnityEngine.UI.LayoutElement>();size.minHeight=size.preferredHeight=rows*94+Math.Max(0,rows-1)*5;
    for(int i=0;i<count;i++){
     int slot=i;var card=WorkshopUIFactory.Vertical("LabSlot"+i,slots);var layout=card.GetComponent<UnityEngine.UI.VerticalLayoutGroup>();layout.padding=new RectOffset(6,6,4,4);layout.spacing=2;
     var surface=card.AddComponent<UnityEngine.UI.Image>();GameTheme.SurfaceOn(surface,GameTheme.Surface);var button=card.AddComponent<UnityEngine.UI.Button>();button.onClick.AddListener(()=>{var job=PrestigeAutomation.ResearchJobs(game.State).FirstOrDefault(j=>j.slot==slot);if(job!=null)game.ShowDetails("research",Game.ResearchIndex(job.id));});
     var row=WorkshopUIFactory.Horizontal("LabIdentity",card.transform,26);var art=WorkshopUIFactory.Node("ResearchIcon",row.transform,typeof(UnityEngine.UI.Image),typeof(UnityEngine.UI.LayoutElement));icons[i]=art.GetComponent<UnityEngine.UI.Image>();icons[i].raycastTarget=false;icons[i].preserveAspect=true;var artSize=art.GetComponent<UnityEngine.UI.LayoutElement>();artSize.minWidth=artSize.preferredWidth=24;artSize.flexibleWidth=0;
     metadata[i]=WorkshopUIFactory.Label("LabTarget",row.transform,"",12,24);metadata[i].color=GameTheme.Accent;metadata[i].GetComponent<UnityEngine.UI.LayoutElement>().flexibleWidth=1;
     status[i]=WorkshopUIFactory.Label("ResearchName",card.transform,"",13,36);status[i].font=GameTheme.Bold;
     time[i]=WorkshopUIFactory.Label("RemainingTime",card.transform,"",12,18);time[i].color=GameTheme.Muted;
     var fill=WorkshopUIFactory.Node("Progress",card.transform,typeof(UnityEngine.UI.Image),typeof(UnityEngine.UI.LayoutElement));fill.GetComponent<UnityEngine.UI.LayoutElement>().ignoreLayout=true;progress[i]=fill.GetComponent<UnityEngine.UI.Image>();progress[i].raycastTarget=false;progress[i].sprite=GameTheme.Rounded;progress[i].type=UnityEngine.UI.Image.Type.Filled;progress[i].fillMethod=UnityEngine.UI.Image.FillMethod.Horizontal;progress[i].color=GameTheme.Accent;var rect=(RectTransform)fill.transform;rect.anchorMin=Vector2.zero;rect.anchorMax=new Vector2(1,0);rect.pivot=Vector2.zero;rect.sizeDelta=new Vector2(0,3);
    }
   }
   for(int i=0;i<count;i++){
    var job=jobs.FirstOrDefault(j=>j.slot==i);var card=status[i].transform.parent;bool active=i<capacity||job!=null;if(card.gameObject.activeSelf!=active)card.gameObject.SetActive(active);
    int level=job==null?0:Game.Level(state,job.id)+1;string key=language+":"+(job?.key??"empty")+":"+level+":"+(i<capacity);
    if(keys[i]!=key){keys[i]=key;status[i].text=job==null?NativeCopy.Text("Frei",language):SettingsRules.Text(language,"research:"+job.id);status[i].color=job==null?GameTheme.Muted:GameTheme.Text;metadata[i].text=NativeCopy.Text("Labor",language)+" "+(i+1)+(job==null?"":" · Lv. "+level);icons[i].sprite=LearningPresentation.Icon(game,false,job?.id??"dataGeneration");}
    string remaining=job==null?"—":(i>=capacity?NativeCopy.Text("Abschluss",language)+" · ":"")+LearningPresentation.Remaining((job.required-job.done)/(job.intro?1:Game.ResearchSpeed(state,job)),language);if(time[i].text!=remaining)time[i].text=remaining;
    progress[i].fillAmount=job==null?0:(float)Math.Min(1,job.done/job.required);
   }
   int shown=Enumerable.Range(0,count).Count(i=>i<capacity||jobs.Any(j=>j.slot==i));float height=((shown+1)/2)*94+Math.Max(0,(shown+1)/2-1)*5;var slotSize=slots.GetComponent<UnityEngine.UI.LayoutElement>();if(slotSize.preferredHeight!=height)slotSize.minHeight=slotSize.preferredHeight=height;
  }
 }
}
