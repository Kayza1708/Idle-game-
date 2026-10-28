using System;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public sealed class MetaLabView : MonoBehaviour
    {
        public Sprite Mira,ModelArt;
        GameRuntime game; Text ledger; Transform rows; string signature=""; PrestigePulse pulse;
        readonly bool[] expanded=new bool[10]; readonly Button[] upgrades=new Button[10]; Button develop;
        string T(string text)=>UiLocalizedText.Translate(text,game.State.Settings.language);
        string N(ScientificNumber value)=>NumberFormatting.Format(value,game.State.Settings.numberFormat,game.State.Settings.language);
        Text Label(string name,Transform parent,string value,int size=14){var t=WorkshopUIFactory.Label(name,parent,value,size,24);AdaptiveTextHeight.Attach(t);return t;}
        public void Initialize(GameRuntime runtime)
        {
            game=runtime;ledger=Label("KnowledgeLedger",transform,"",17);rows=WorkshopUIFactory.Vertical("Models",transform).transform;
            pulse=Instantiate(game.PrestigePrefab.Pulse,GetComponentInParent<Canvas>().transform);WorkshopUIFactory.Fill((RectTransform)pulse.transform);pulse.gameObject.AddComponent<SafeArea>();pulse.Core.GetComponent<Image>().sprite=ModelArt;Refresh();
        }
        void Update(){if(game!=null)Refresh();}
        string Kind(string kind){switch(kind){case "revenue":return "Einnahmen";case "users":return "Nutzer";case "data":return "Daten";case "tap":return "Tap-Ertrag";case "items":return "Itemboni";case "compute":return "Compute";case "research":return "Forschungsgeschwindigkeit";case "training":return "Trainingsgeschwindigkeit";case "analysis":return "Analysegeschwindigkeit";default:return "Zusatzsockel";}}
        string MainEffect(GameState s,int index)
        {
            var m=MetaBalance.Models[index];int level=Math.Max(0,s.Meta.models[index]);
            if(m.Id=="K10")return T("Universelle Slots")+": "+(level>=PrestigeRules.V("modelSlotsLevel")?2:1)+" · "+T("Itemboni")+" ×"+(PrestigeRules.V("modelItemBase")+PrestigeRules.V("modelItemLevel")*level).ToString("F3");
            return T(Kind(m.Kind))+" ×"+(1+(m.Base-1)*(1+PrestigeRules.V("modelPrimaryLevel")*level)).ToString("F3");
        }
        void Refresh()
        {
            var s=game.State;
            ledger.text=T("GEHEIMES LABOR")+"\n"+T("Erkenntnis")+" "+N(ScientificNumber.FromData(s.Prestige.knowledge))+" · +"+N(PrestigeRules.KnowledgeRate(s))+"/s";
            string next=string.Join(",",s.Meta.models)+"|"+s.Workshop.activeModel+"|"+s.Meta.tutorial+"|"+s.Workshop.reducedMotion+"|"+s.Settings.language+"|"+string.Join(",",expanded);
            if(next!=signature){signature=next;Build();}UpdateAffordability();
        }
        void Build()
        {
            var s=game.State;WorkshopUIFactory.Clear(rows);Array.Clear(upgrades,0,upgrades.Length);
            if(!string.IsNullOrEmpty(s.Meta.tutorial))
            {
                var coach=WorkshopUIFactory.Horizontal("ModelMira",rows,72);
                var portrait=WorkshopUIFactory.Node("Mira",coach.transform,typeof(Image));WorkshopUIFactory.Size(portrait,64);var width=portrait.GetComponent<LayoutElement>();width.minWidth=width.preferredWidth=60;width.flexibleWidth=0;
                portrait.GetComponent<Image>().sprite=Mira;portrait.GetComponent<Image>().preserveAspect=true;portrait.GetComponent<Image>().raycastTarget=false;MiraMotion.Attach(portrait.GetComponent<Image>(),game,"success");
                Label("MiraExplanation",coach.transform,s.Meta.tutorial=="lab"?"Mira: Hier entwickelst du fähigere KI-Modelle. 1.000 Erkenntnis für deine erste zufällige KI stehen bereit. Genau ein Modell ist aktiv; Sammlung und Upgrades bleiben beim Axiom erhalten.":"Mira: Dein neuer Axiomzyklus erhält Modelle, Forschung, Items und permanente Slots. Der INT-Zyklus beginnt neu. Axiome und Modellfähigkeiten helfen beim Wiederaufbau.",13);
                WorkshopUIFactory.Button("AcknowledgeMira",rows,"Verstanden",()=>game.Act(v=>{var n=v.Copy();n.Meta.tutorial="";return n;}));
            }
            develop=WorkshopUIFactory.Button("DevelopModel",rows,T("Zufällige KI entwickeln")+" · "+N(MetaRules.ModelCost(s))+" "+T("Erkenntnis"),Develop);
            GameTheme.ButtonStyle(develop,true);develop.gameObject.SetActive(s.Meta.models.Any(l=>l<0));
            Label("ModelPoolRule",rows,"Gleiche Chance je unbekanntem Modell · keine Duplikate · genau ein Modell aktiv",12);
            var options=WorkshopUIFactory.Horizontal("ModelOptions",rows,44);
            var deactivate=WorkshopUIFactory.Button("DeactivateModel",options.transform,"Modell deaktivieren",()=>game.Act(v=>MetaRules.Select(v,null)));deactivate.interactable=game.Writable&&!ChallengeRules.Active(s)&&!string.IsNullOrEmpty(s.Workshop.activeModel);GameTheme.CompactAction(deactivate,false);
            var motion=WorkshopUIFactory.Button("ModelMotion",options.transform,s.Workshop.reducedMotion?"Bewegung aus":"Bewegung an",()=>{Cancel();game.Act(v=>{var n=v.Copy();n.Workshop.reducedMotion=!n.Workshop.reducedMotion;n.Settings.effects=!n.Workshop.reducedMotion;return n;});});GameTheme.CompactAction(motion,false);
            for(int i=0;i<MetaBalance.Models.Length;i++)
            {
                int index=i;var m=MetaBalance.Models[i];bool owned=s.Meta.models[i]>=0,active=s.Workshop.activeModel==m.Id;
                var panel=WorkshopUIFactory.Vertical("model-"+m.Id,rows);panel.AddComponent<NaturalPanel>();var layout=panel.GetComponent<VerticalLayoutGroup>();layout.padding=new RectOffset(8,8,6,6);layout.spacing=3;
                GameTheme.SurfaceOn(panel.AddComponent<Image>(),GameTheme.Surface);panel.GetComponent<Image>().raycastTarget=false;
                var head=WorkshopUIFactory.Horizontal("ModelHeader",panel.transform,96);head.GetComponent<HorizontalLayoutGroup>().childForceExpandHeight=false;head.GetComponent<HorizontalLayoutGroup>().childAlignment=TextAnchor.MiddleLeft;var art=WorkshopUIFactory.Node("ModelArt",head.transform,typeof(Image));WorkshopUIFactory.Size(art,64);var artSize=art.GetComponent<LayoutElement>();artSize.minWidth=artSize.preferredWidth=64;artSize.flexibleWidth=0;var image=art.GetComponent<Image>();image.sprite=ModelArt;image.preserveAspect=true;image.raycastTarget=false;image.color=owned?Color.white:new Color(1,1,1,.3f);
                var text=WorkshopUIFactory.Vertical("ModelSummary",head.transform);text.AddComponent<LayoutElement>().flexibleWidth=1;
                var title=Label("ModelTitle",text.transform,T(m.Name)+(active?" · ✓":""),16);title.font=GameTheme.Bold;title.color=active?GameTheme.Accent:GameTheme.Text;
                Label("ModelLevel",text.transform,owned?"Lv. "+s.Meta.models[i]+" / "+MetaRules.ModelLimit(s):T("Noch unbekannt"),12);
                if(owned)Label("ModelPrimary",text.transform,MainEffect(s,index),13);
                var details=WorkshopUIFactory.Button("ModelDetails-"+m.Id,head.transform,"i",()=>{expanded[index]=!expanded[index];signature="";Refresh();});var hit=details.GetComponent<LayoutElement>();hit.minWidth=hit.preferredWidth=44;hit.flexibleWidth=0;hit.minHeight=hit.preferredHeight=44;
                if(expanded[index])
                {
                    var preview=s.Copy();preview.Workshop.activeModel=m.Id;preview.Workshop.activeModelLevel=Math.Max(0,s.Meta.models[i]);
                    Label("ModelEffect",panel.transform,MainEffect(s,index)+"\n"+T("Revenue-Kern")+" ×"+MetaRules.Core(preview).ToString("F3")+"\n"+T(MetaRules.Level(s,"D06")>0?"Zweite Fähigkeit aktiv":"Modellfähigkeiten")+": "+T(m.Secondary)+(MetaRules.Level(s,"D06")>0?"":"\n"+T("Benötigt")+": "+T(MetaBalance.Axioms.First(a=>a.Id=="D06").Name)),13);
                }
                if(owned)
                {
                    var actions=WorkshopUIFactory.Horizontal("ModelActions",panel.transform,44);
                    var choose=WorkshopUIFactory.Button("Select-"+m.Id,actions.transform,active?T("Aktiv"):T("Aktivieren"),()=>game.Act(v=>MetaRules.Select(v,m.Id),"model-select"));choose.interactable=game.Writable&&!ChallengeRules.Active(s)&&!active;GameTheme.CompactAction(choose,false);
                    upgrades[i]=WorkshopUIFactory.Button("Upgrade-"+m.Id,actions.transform,T("Level erhöhen")+" · "+N(MetaRules.UpgradeCost(s,index))+" "+T("Erkenntnis"),()=>game.Act(v=>MetaRules.Upgrade(v,m.Id),"model-upgrade"));GameTheme.ButtonStyle(upgrades[i],true);
                }
            }
        }
        void UpdateAffordability(){var s=game.State;if(develop!=null)develop.interactable=game.Writable&&!ChallengeRules.Active(s)&&s.Prestige.lab&&ScientificNumber.FromData(s.Prestige.knowledge).CompareTo(MetaRules.ModelCost(s))>=0;for(int i=0;i<upgrades.Length;i++)if(upgrades[i]!=null)upgrades[i].interactable=game.Writable&&!ChallengeRules.Active(s)&&s.Meta.models[i]<MetaRules.ModelLimit(s)&&ScientificNumber.FromData(s.Prestige.knowledge).CompareTo(MetaRules.UpgradeCost(s,i))>=0;}
        void Develop(){var owned=(int[])game.State.Meta.models.Clone();if(game.Act(MetaRules.Develop,"model-develop")){int n=Enumerable.Range(0,10).First(i=>owned[i]<0&&game.State.Meta.models[i]>=0);pulse.Play(T("Entwickelt")+" · "+T(MetaBalance.Models[n].Name),game.State.Workshop.reducedMotion||!game.State.Settings.effects);}}
        public void Cancel(){if(pulse!=null)pulse.Cancel();}void OnDisable(){Cancel();}void OnDestroy(){if(pulse!=null)Destroy(pulse.gameObject);}
    }
}
