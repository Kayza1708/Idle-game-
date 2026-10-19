using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public sealed class GameRuntime : MonoBehaviour
    {
        // Test injection never changes the normal persistent path or grants currency.
        public static string SavePathOverride;
        public Text Credits,Compute,Users,Data,Status,Overdrive,Hint;
        public Button TapButton,HardwareTab,TrainingTab,ResearchTab,SaveButton,ItemsTab,PrestigeTab;
        public MetaLabView ModelPrefab;public MetaLabView ModelsView {get;private set;}public PrestigeNetworkView PrestigePrefab;public PrestigeNetworkView PrestigeView {get;private set;}public WorkshopUI WorkshopPrefab;public WorkshopUI WorkshopView {get;private set;}
        public ChallengeUI ChallengeView {get;private set;}public Transform Content;public ActionCard CardPrefab;public Sprite[] HardwareSprites;
        public GameState State {get;private set;}
        public bool Writable {get;private set;}
        public string SavePath=>store?.PathName;
        AtomicSaveStore store;string tab="hardware",message="Bereit";bool started,paused,focused=true;LifetimeView lifetimeView;RetentionView retentionView;MissionView missionView;
        GameObject queueControls;string queueSignature="";
        float nextRefresh,nextSave;readonly List<ActionCard> cards=new List<ActionCard>();
        static double Now=>DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        void Start()
        {
            store=new AtomicSaveStore(SavePathOverride??Path.Combine(Application.persistentDataPath,"unity-slice-v1.json"),new UnitySaveCodec());
            var loaded=store.Load(Now);Writable=loaded.Writable;State=loaded.State??Game.New(Now);message=loaded.Message??"Lokal gespeichert";
            double elapsed=Math.Max(0,(Now-State.SavedAt)/1000);var before=State.Credits;
            if(Writable)State=Game.Advance(State,Now);
            if(elapsed>10&&loaded.State!=null&&Writable)message="Willkommen zurück: +"+State.Credits.Subtract(before)+" Credits (Offline-Limit berücksichtigt)";
            TapButton.onClick.AddListener(()=>Act(s=>Game.Tap(s,s.SavedAt)));
            HardwareTab.onClick.AddListener(()=>Show("hardware"));TrainingTab.onClick.AddListener(()=>Show("training"));ResearchTab.onClick.AddListener(()=>Show("research"));SaveButton.onClick.AddListener(()=>{Tick();Save();Refresh();});
            ItemsTab.onClick.AddListener(()=>Show("items"));PrestigeTab.onClick.AddListener(()=>Show("prestige"));started=true;Show(tab);Save();Refresh();
        }
        void Update()
        {
            if(!started||paused||!focused)return;
            // UTC elapsed time drives the domain; refresh frequency only controls presentation.
            if(Time.unscaledTime>=nextRefresh){Tick();Refresh();nextRefresh=Time.unscaledTime+.1f;}
            if(Time.unscaledTime>=nextSave){Save();nextSave=Time.unscaledTime+5;}
        }
        void Tick(bool active=true){if(Writable){var before=State;long resets=State.Prestige.resets,axioms=State.Meta.resets;int ledger=State.Retention.ledger.Length;State=Game.Advance(State,Now,active&&!paused&&focused);if(State.Prestige.resets!=resets||State.Meta.resets!=axioms||State.Retention.ledger.Length!=ledger){Save();if(!Writable)State=before;}}}
        public bool Act(Func<GameState,GameState> action)
        {
            if(!Writable)return false;Tick();if(!Writable){Refresh();return false;}var before=State;State=action(State);
            if(!ReferenceEquals(before,State)) {message="Aktion gespeichert";Save();if(!Writable)State=before;}Refresh();return !ReferenceEquals(before,State)&&Writable;
        }
        void Save()
        {
            if(!Writable||State==null||store==null)return;
            try{store.Save(State);}catch(Exception e){Writable=false;message="Speichern gesperrt: "+e.Message;Debug.LogWarning(message);}
        }
        void OnApplicationPause(bool value)
        {
            if(!started)return;
            if(value){WorkshopView?.Forge.Cancel();PrestigeView?.Cancel();ModelsView?.Cancel();Tick();Save();paused=true;}else{paused=false;Tick(false);Save();Refresh();}
        }
        void OnApplicationFocus(bool focused){if(!started)return;if(focused){Tick(false);this.focused=true;Save();Refresh();}else{WorkshopView?.Forge.Cancel();PrestigeView?.Cancel();ModelsView?.Cancel();Tick();this.focused=false;Save();}}
        void OnApplicationQuit(){Tick();Save();}
        void OnDestroy(){if(started){Tick();Save();}}
        void Show(string selected)
        {
            if(missionView!=null){missionView.gameObject.SetActive(false);Destroy(missionView.gameObject);missionView=null;}var oldMissions=Content.Find("MissionsAccess");if(oldMissions!=null){oldMissions.gameObject.SetActive(false);Destroy(oldMissions.gameObject);}
            if(retentionView!=null){retentionView.gameObject.SetActive(false);Destroy(retentionView.gameObject);retentionView=null;}var oldProfile=Content.Find("ProfileAccess");if(oldProfile!=null){oldProfile.gameObject.SetActive(false);Destroy(oldProfile.gameObject);}
            if(lifetimeView!=null){lifetimeView.gameObject.SetActive(false);Destroy(lifetimeView.gameObject);lifetimeView=null;}var oldProgress=Content.Find("ProgressAccess");if(oldProgress!=null){oldProgress.gameObject.SetActive(false);Destroy(oldProgress.gameObject);}
            if(ChallengeView!=null){Destroy(ChallengeView.gameObject);ChallengeView=null;}
            if(queueControls!=null){queueControls.SetActive(false);Destroy(queueControls);queueControls=null;}queueSignature="";
            if(ModelsView!=null){ModelsView.Cancel();Destroy(ModelsView.gameObject);ModelsView=null;}if(PrestigeView!=null){PrestigeView.Cancel();Destroy(PrestigeView.gameObject);PrestigeView=null;}if(WorkshopView!=null){Destroy(WorkshopView.gameObject);WorkshopView=null;}
            var oldChallenge=Content.Find("ChallengesAccess");if(oldChallenge!=null){oldChallenge.gameObject.SetActive(false);Destroy(oldChallenge.gameObject);}var oldLab=Content.Find("SecretLab");if(oldLab!=null){oldLab.gameObject.SetActive(false);Destroy(oldLab.gameObject);}tab=selected;foreach(var card in cards){card.gameObject.SetActive(false);Destroy(card.gameObject);}cards.Clear();
            bool workshop=tab=="items"||tab=="prestige"||tab=="models"||tab=="challenges"||tab=="progress"||tab=="profile"||tab=="missions";
            foreach(var name in new[]{"Laboratory","Overdrive","Guidance"}){var child=Content.GetComponentInParent<SafeArea>().transform.Find(name);if(child!=null)child.gameObject.SetActive(!workshop);}
            Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=1;
            if(tab=="missions"){missionView=WorkshopUIFactory.Vertical("Missions",Content).AddComponent<MissionView>();missionView.Initialize(this);Refresh();return;}
            if(tab=="profile"){retentionView=WorkshopUIFactory.Vertical("Profile",Content).AddComponent<RetentionView>();retentionView.Initialize(this);Refresh();return;}
            if(tab=="progress"){lifetimeView=WorkshopUIFactory.Vertical("Lifetime",Content).AddComponent<LifetimeView>();lifetimeView.Initialize(this);Refresh();return;}
            if(tab=="challenges"){ChallengeView=WorkshopUIFactory.Vertical("Challenges",Content).AddComponent<ChallengeUI>();ChallengeView.Initialize(this);Refresh();return;}
            if(tab=="models"){ModelsView=Instantiate(ModelPrefab,Content);ModelsView.Initialize(this);Refresh();return;}
            if(tab=="research"){WorkshopUIFactory.Button("MissionsAccess",Content,"Missionen · Tages-/Wochen-/Monatsziele",()=>Show("missions"));WorkshopUIFactory.Button("ProfileAccess",Content,"Profil · Achievements / Laborziele / Post",()=>Show("profile"));WorkshopUIFactory.Button("ProgressAccess",Content,"Dauerhafter Fortschritt · Statistik / Mastery",()=>Show("progress"));WorkshopUIFactory.Button("ChallengesAccess",Content,ChallengeRules.Active(State)?"Aktive Challenge · zurückkehren":"Challenges · 10 Familien / 69 Stufen",()=>Show("challenges"));var lab=WorkshopUIFactory.Button("SecretLab",Content,State.Prestige.lab?"Geheimes Labor · KI-Modelle":"Geheimes Labor · ab "+PrestigeRules.V("labThreshold")+" Gesamt-INT",()=>Show("models"));lab.interactable=Writable&&State.Prestige.lab;}
            if(tab=="prestige"){PrestigeView=Instantiate(PrestigePrefab,Content);PrestigeView.Initialize(this);Refresh();return;}
            if(workshop){WorkshopView=Instantiate(WorkshopPrefab,Content);WorkshopView.Initialize(this);Refresh();return;}
            int count=tab=="hardware"?Balance.Hardware.Length:tab=="training"?3:Balance.Research.Length;
            for(int i=0;i<count;i++)
            {
                int index=i;var card=Instantiate(CardPrefab,Content);card.gameObject.name=tab+"-"+(tab=="hardware"?Balance.Hardware[i].Id:tab=="training"?PrestigeAutomation.Tracks[i]:Balance.Research[i].Id);cards.Add(card);
                if(tab=="hardware") {card.Icon.sprite=HardwareSprites[i];card.Button.onClick.AddListener(()=>Act(s=>Game.Buy(s,Balance.Hardware[index].Id)));}
                else {card.Icon.gameObject.SetActive(false);if(tab=="training")card.Button.onClick.AddListener(()=>Act(s=>Game.Train(s,PrestigeAutomation.Tracks[index])));else card.Button.onClick.AddListener(()=>Act(s=>Game.Research(s,Balance.Research[index].Id)));}
            }
            Refresh();
        }
        void RefreshQueues()
        {
            if(tab!="training"&&tab!="research")return;string signature=tab+string.Join(",",State.Prestige.trainingQueue.Select(j=>j.track+":"+j.level))+string.Join(",",State.Prestige.researchQueue);if(signature==queueSignature)return;queueSignature=signature;if(queueControls!=null){queueControls.SetActive(false);Destroy(queueControls);}queueControls=WorkshopUIFactory.Vertical("UnpaidQueues",Content);
            if(tab=="training")for(int i=0;i<State.Prestige.trainingQueue.Length;i++){int index=i;var job=State.Prestige.trainingQueue[i];WorkshopUIFactory.Button("CancelTrainingQueue"+i,queueControls.transform,"Wartend: "+job.track+" → "+job.level+" · entfernen",()=>Act(s=>{var n=s.Copy();string track=n.Prestige.trainingQueue[index].track;n.Prestige.trainingQueue=n.Prestige.trainingQueue.Where((j,k)=>k<index||j.track!=track).ToArray();return n;}));}
            if(tab=="research")for(int i=0;i<State.Prestige.researchQueue.Length;i++){int index=i;string id=State.Prestige.researchQueue[i];WorkshopUIFactory.Button("CancelResearchQueue"+i,queueControls.transform,"Wartend: "+id+" · entfernen",()=>Act(s=>{var n=s.Copy();n.Prestige.researchQueue=n.Prestige.researchQueue.Where((j,k)=>k!=index).ToArray();return n;}));}
        }
        static string Seconds(double seconds)=>Math.Max(0,seconds).ToString("F0")+" s";
        void Refresh()
        {
            if(State==null)return;RefreshQueues();if(tab=="research"){var access=Content.Find("ChallengesAccess")?.GetComponent<Button>();if(access!=null)access.GetComponentInChildren<Text>().text=ChallengeRules.Active(State)?"Aktive Challenge · zurückkehren":"Challenges · 10 Familien / 69 Stufen";var lab=Content.Find("SecretLab")?.GetComponent<Button>();if(lab!=null){lab.interactable=Writable&&State.Prestige.lab;lab.GetComponentInChildren<Text>().text=State.Prestige.lab?"Geheimes Labor · KI-Modelle":"Geheimes Labor · "+State.Prestige.Total+" / "+PrestigeRules.V("labThreshold")+" Gesamt-INT";}}
            Credits.text="CREDITS\n"+State.Credits+"  (+"+Game.Income(State)+"/s)";
            Compute.text="COMPUTE\n"+Game.Compute(State);Users.text="NUTZER\n"+Game.Users(State);Data.text="DATEN\n"+State.Data+" (+"+Game.DataRate(State)+"/s)";
            Overdrive.text=State.ActiveUntil>State.SavedAt?"OVERDRIVE ×"+Game.OverdriveFactor(State)+" · "+Seconds((State.ActiveUntil-State.SavedAt)/1000):"OVERDRIVE  "+State.Charge+" / "+Balance.OverdriveCharge+(State.CooldownUntil>State.SavedAt?" · Pause "+Seconds((State.CooldownUntil-State.SavedAt)/1000):"");
            if(!Writable)foreach(var control in Content.GetComponentsInChildren<Button>())control.interactable=false;Status.text=(ChallengeRules.Active(State)?"CHALLENGE · Hauptspiel pausiert · ":"")+(Writable?"● ":"! ")+message;Status.color=Writable?new Color(.65f,.9f,.8f):new Color(1,.65f,.55f);
            Hint.text=State.Meta.tutorial=="lab"?"Mira: Geheimes Labor freigeschaltet! Öffne Forschung → KI-Modelle.":State.Prestige.resets>0?"INT verstärkt die Produktion. Knoten und Automation im INT-Netz.":State.Tutorial=="tap"?"Tippe auf das Labor und kaufe deinen ersten Rechner.":State.Tutorial=="training"?"Training: erstes Qualitätstraining kostenlos.":State.Tutorial=="research"?"Forschung: erste Datenerzeugung kostenlos.":"Hardware liefert Compute → Nutzer → Credits und Daten.";
            TapButton.interactable=Writable&&!ChallengeRules.Is(State,"no-taps");SaveButton.interactable=Writable;
            HardwareTab.GetComponentInChildren<Text>().color=tab=="hardware"?Color.white:new Color(.65f,.75f,.8f);TrainingTab.GetComponentInChildren<Text>().color=tab=="training"?Color.white:new Color(.65f,.75f,.8f);ResearchTab.GetComponentInChildren<Text>().color=tab=="research"?Color.white:new Color(.65f,.75f,.8f);
            for(int i=0;i<cards.Count;i++)
            {
                var card=cards[i];
                if(tab=="hardware")
                {
                    var h=Balance.Hardware[i];var cost=Game.HardwareCost(State,i);card.Title.text=h.Name+"  ×"+State.Hardware[i];card.Detail.text="Kaufen: "+cost+" C  ·  +"+ScientificNumber.From(h.Compute)+" Compute";card.Button.interactable=Writable&&i<(ChallengeRules.Current(State)?.ClassLimit??State.Hardware.Length)&&State.Credits.CompareTo(cost)>=0;if(i>=(ChallengeRules.Current(State)?.ClassLimit??State.Hardware.Length))card.Detail.text="In dieser Challenge gesperrt";
                }
                else if(tab=="training")
                {
                    string id=PrestigeAutomation.Tracks[i];var cost=Game.TrainingCost(State,id);card.Title.text=(i==0?"Qualität":i==1?"Effizienz":"Integration")+"  Lv. "+Game.TrainingLevel(State,id);
                    card.Detail.text=State.Training!=null?"Läuft: "+State.Training.id+" · "+Seconds((State.Training.required-State.Training.done)/Game.WorkSpeed(State)):"Start: "+cost+" C · "+Seconds(Game.TrainingWork(State,id)/Game.WorkSpeed(State));card.Button.interactable=Writable&&Game.TrainingAvailable(State,id)&&(State.Training==null?State.Credits.CompareTo(cost)>=0&&State.Data.CompareTo(Game.TrainingData(State,id))>=0:PrestigeRules.Has(State,"T03")&&State.Prestige.trainingQueue.Length<2);if(id=="integration")card.Detail.text+=" · "+Game.TrainingData(State,id)+" Daten";if(State.Training!=null&&PrestigeRules.Has(State,"T03"))card.Detail.text+=" · Einreihen ("+State.Prestige.trainingQueue.Length+"/2)";
                }
                else
                {
                    var r=Balance.Research[i];var block=Game.ResearchBlock(State,i);card.Title.text=r.Name+"  Lv. "+State.Research[i];card.Detail.text=State.ResearchJob?.id==r.Id?"Läuft · "+Seconds((State.ResearchJob.required-State.ResearchJob.done)/(State.ResearchJob.intro?1:Game.WorkSpeed(State,true))):(block??"Start")+" · "+Game.ResearchCost(State,i)+" Daten";card.Button.interactable=Writable&&(block==null||block=="Labor belegt"&&!State.Prestige.researchQueue.Contains(r.Id)&&State.Prestige.researchQueue.Length<PrestigeAutomation.ResearchCapacity(State));var job=PrestigeAutomation.ResearchJobs(State).FirstOrDefault(j=>j.id==r.Id);if(job!=null)card.Detail.text="Läuft · "+Seconds((job.required-job.done)/Game.WorkSpeed(State,true));if(block=="Labor belegt"){card.Detail.text+=" · Einreihen ("+State.Prestige.researchQueue.Length+"/"+PrestigeAutomation.ResearchCapacity(State)+")";card.Button.interactable=Writable&&PrestigeAutomation.CanQueueResearch(State,r.Id);}
                }
            }
        }
    }
}
