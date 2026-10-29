using System;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
namespace IdleIntelligence.Runtime
{
    // Shared, horizontally scrollable unpaid plan cards. Slots are allocated
    // once per view, never recreated when work, currency or progress ticks.
    public sealed class PlannedQueueView:MonoBehaviour
    {
        sealed class Entry
        {public GameObject Root;public CanvasGroup Fade;public UnityEngine.UI.Button Details,Earlier,Later,Remove;public UnityEngine.UI.Text Name,Position,Payment;public UnityEngine.UI.Image Icon;}
        GameRuntime game;bool training;string renderedSignature,language;int[] levels;
        UnityEngine.UI.Text heading,pause;Entry[] entries;UnityEngine.UI.ScrollRect scroll;
        public void Initialize(GameRuntime runtime,bool isTraining)
        {
            game=runtime;training=isTraining;heading=WorkshopUIFactory.Label("NextHeading",transform,"",14,24);heading.font=GameTheme.Bold;
            var host=WorkshopUIFactory.Node("PlanScroll",transform,typeof(UnityEngine.UI.ScrollRect));WorkshopUIFactory.Size(host,146);scroll=host.GetComponent<UnityEngine.UI.ScrollRect>();scroll.horizontal=true;scroll.vertical=false;scroll.movementType=UnityEngine.UI.ScrollRect.MovementType.Clamped;
            var viewport=WorkshopUIFactory.Node("Viewport",host.transform,typeof(UnityEngine.UI.Image),typeof(UnityEngine.UI.Mask));WorkshopUIFactory.Fill((RectTransform)viewport.transform);viewport.GetComponent<UnityEngine.UI.Image>().color=Color.white;viewport.GetComponent<UnityEngine.UI.Mask>().showMaskGraphic=false;
            var content=WorkshopUIFactory.Node("Content",viewport.transform,typeof(UnityEngine.UI.HorizontalLayoutGroup),typeof(UnityEngine.UI.ContentSizeFitter));var rect=(RectTransform)content.transform;rect.anchorMin=new Vector2(0,0);rect.anchorMax=new Vector2(0,1);rect.pivot=new Vector2(0,.5f);rect.sizeDelta=Vector2.zero;
            var layout=content.GetComponent<UnityEngine.UI.HorizontalLayoutGroup>();layout.spacing=6;layout.childControlWidth=layout.childControlHeight=true;layout.childForceExpandWidth=false;layout.childForceExpandHeight=true;content.GetComponent<UnityEngine.UI.ContentSizeFitter>().horizontalFit=UnityEngine.UI.ContentSizeFitter.FitMode.PreferredSize;
            scroll.viewport=(RectTransform)viewport.transform;scroll.content=rect;entries=new Entry[training?2:8];levels=new int[entries.Length];
            for(int i=0;i<entries.Length;i++){
                int index=i;var root=WorkshopUIFactory.Vertical("PlanCard"+i,content.transform);var width=root.AddComponent<UnityEngine.UI.LayoutElement>();width.minWidth=width.preferredWidth=172;width.flexibleWidth=0;var group=root.GetComponent<UnityEngine.UI.VerticalLayoutGroup>();group.spacing=2;group.padding=new RectOffset(6,6,4,4);
                var surface=root.AddComponent<UnityEngine.UI.Image>();GameTheme.SurfaceOn(surface,GameTheme.Surface);surface.raycastTarget=false;
                var entry=new Entry{Root=root,Fade=root.AddComponent<CanvasGroup>()};entry.Position=WorkshopUIFactory.Label("Position",root.transform,"",12,18);entry.Position.color=GameTheme.Accent;
                var details=WorkshopUIFactory.Horizontal("PlanDetails",root.transform,48);details.GetComponent<UnityEngine.UI.HorizontalLayoutGroup>().spacing=5;var hit=details.AddComponent<UnityEngine.UI.Image>();hit.color=Color.clear;entry.Details=details.AddComponent<UnityEngine.UI.Button>();entry.Details.onClick.AddListener(()=>Open(index));
                var image=WorkshopUIFactory.Node("OriginalIcon",details.transform,typeof(UnityEngine.UI.Image),typeof(UnityEngine.UI.LayoutElement));entry.Icon=image.GetComponent<UnityEngine.UI.Image>();entry.Icon.preserveAspect=true;entry.Icon.raycastTarget=false;var artSize=image.GetComponent<UnityEngine.UI.LayoutElement>();artSize.minWidth=artSize.preferredWidth=32;artSize.flexibleWidth=0;
                entry.Name=WorkshopUIFactory.Label("PlanName",details.transform,"",13,50);entry.Name.GetComponent<UnityEngine.UI.LayoutElement>().flexibleWidth=1;
                entry.Payment=WorkshopUIFactory.Label("PaymentAtStart",root.transform,"",12,20);entry.Payment.color=GameTheme.Muted;
                var actions=WorkshopUIFactory.Horizontal("PlanOrder",root.transform,44);actions.GetComponent<UnityEngine.UI.HorizontalLayoutGroup>().spacing=3;
                entry.Earlier=Action("Earlier",actions.transform,"←",index,"earlier");entry.Later=Action("Later",actions.transform,"→",index,"later");entry.Remove=Action("Remove",actions.transform,"×",index,"remove");entries[i]=entry;
            }
            pause=WorkshopUIFactory.Label("PlanPause",transform,"",12,26);pause.color=GameTheme.Muted;RefreshView();
        }
        UnityEngine.UI.Button Action(string name,Transform parent,string title,int index,string action)
        {
            var button=WorkshopUIFactory.Button(name,parent,title,()=>{
                string signature=renderedSignature;game.Act(s=>QueueControls.Change(s,training,signature,index,action),"queue-plan");
            });GameTheme.CompactAction(button,false);var size=button.GetComponent<UnityEngine.UI.LayoutElement>();size.minWidth=size.preferredWidth=44;size.minHeight=size.preferredHeight=44;size.flexibleWidth=1;return button;
        }
        string Id(int i)=>training?game.State.Prestige.trainingQueue[i].track:game.State.Prestige.researchQueue[i];
        void Open(int index)
        {int count=training?game.State.Prestige.trainingQueue.Length:game.State.Prestige.researchQueue.Length;if(index>=count)return;game.ShowDetails(training?"training":"research",training?Array.IndexOf(PrestigeAutomation.Tracks,Id(index)):Game.ResearchIndex(Id(index)));}
        Sprite Icon(string id)=>LearningPresentation.Icon(game,training,id);
        void Update()
        {
            if(game==null||entries==null)return;bool reduced=game.State.Workshop.reducedMotion||!game.State.Settings.effects;
            foreach(var entry in entries)if(entry.Fade.alpha<1)entry.Fade.alpha=reduced?1:Mathf.MoveTowards(entry.Fade.alpha,1,Time.unscaledDeltaTime*3);
        }
        public void RefreshView()
        {
            if(game==null)return;var state=game.State;int count=training?state.Prestige.trainingQueue.Length:state.Prestige.researchQueue.Length;bool visible=count>0;
            if(gameObject.activeSelf!=visible)gameObject.SetActive(visible);if(!visible)return;
            string signature=QueueControls.Signature(state,training),locale=state.Settings.language;bool orderChanged=signature!=renderedSignature;bool changed=orderChanged||locale!=language;renderedSignature=signature;language=locale;
            if(changed)heading.text=NativeCopy.Text("Als Nächstes",locale);
            for(int i=0;i<entries.Length;i++){
                var entry=entries[i];if(entry.Root.activeSelf!=(i<count))entry.Root.SetActive(i<count);if(i>=count)continue;
                string id=Id(i);int target=training?state.Prestige.trainingQueue[i].level:Game.Level(state,id)+1;
                if(changed||levels[i]!=target){levels[i]=target;entry.Position.text="#"+(i+1)+" · Lv. "+target;entry.Name.text=training?id=="integration"?NativeCopy.Text("Integration",locale):SettingsRules.Text(locale,"workshop:"+id):SettingsRules.Text(locale,"research:"+id);if(locale=="de"&&id=="modelArchitecture")entry.Name.text="Modell-\narchitektur";entry.Icon.sprite=Icon(id);entry.Payment.text=NativeCopy.Text("Zahlung bei Start",locale);if(orderChanged&&state.Settings.effects&&!state.Workshop.reducedMotion)entry.Fade.alpha=.65f;}
                entry.Earlier.interactable=game.Writable&&QueueControls.CanMove(state,training,i,-1);entry.Later.interactable=game.Writable&&QueueControls.CanMove(state,training,i,1);entry.Remove.interactable=game.Writable;
            }
            string reason=state.Prestige.resetIntent?"Reset vorgemerkt":training?state.Training!=null?"Nach aktivem Training":state.Credits.CompareTo(Game.TrainingCost(state,Id(0)))<0?"Zu wenig Credits":state.Data.CompareTo(Game.TrainingData(state,Id(0)))<0?"Zu wenig Daten":"":AdRewards.FreeLab(state)<0?"Alle Labore belegt":Game.ResearchBlock(state,Game.ResearchIndex(Id(0)))??"";
            string text=NativeCopy.Text(reason,locale);if(pause.text!=text)pause.text=text;pause.gameObject.SetActive(text.Length>0);
        }
    }
}
