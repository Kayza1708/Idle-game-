using System;
using System.Collections.Generic;
using System.IO;
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
        public Button TapButton,HardwareTab,TrainingTab,ResearchTab,SaveButton,ItemsTab;
        public WorkshopUI WorkshopPrefab;public WorkshopUI WorkshopView {get;private set;}
        public Transform Content;public ActionCard CardPrefab;public Sprite[] HardwareSprites;
        public GameState State {get;private set;}
        public bool Writable {get;private set;}
        public string SavePath=>store?.PathName;
        AtomicSaveStore store;string tab="hardware",message="Bereit";bool started,paused;
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
            ItemsTab.onClick.AddListener(()=>Show("items"));started=true;Show(tab);Save();Refresh();
        }
        void Update()
        {
            if(!started||paused)return;
            // UTC elapsed time drives the domain; refresh frequency only controls presentation.
            if(Time.unscaledTime>=nextRefresh){Tick();Refresh();nextRefresh=Time.unscaledTime+.1f;}
            if(Time.unscaledTime>=nextSave){Save();nextSave=Time.unscaledTime+5;}
        }
        void Tick(){if(Writable)State=Game.Advance(State,Now);}
        public bool Act(Func<GameState,GameState> action)
        {
            if(!Writable)return false;Tick();var before=State;State=action(State);
            if(!ReferenceEquals(before,State)) {message="Aktion gespeichert";Save();}Refresh();return !ReferenceEquals(before,State)&&Writable;
        }
        void Save()
        {
            if(!Writable||State==null||store==null)return;
            try{store.Save(State);}catch(Exception e){Writable=false;message="Speichern gesperrt: "+e.Message;Debug.LogWarning(message);}
        }
        void OnApplicationPause(bool value)
        {
            if(!started)return;
            if(value){WorkshopView?.Forge.Cancel();Tick();Save();paused=true;}else{paused=false;Tick();Save();Refresh();}
        }
        void OnApplicationFocus(bool focused){if(!started)return;if(focused){Tick();Save();Refresh();}else{WorkshopView?.Forge.Cancel();Tick();Save();}}
        void OnApplicationQuit(){Tick();Save();}
        void OnDestroy(){if(started){Tick();Save();}}
        void Show(string selected)
        {
            if(WorkshopView!=null){Destroy(WorkshopView.gameObject);WorkshopView=null;}
            tab=selected;foreach(var card in cards){card.gameObject.SetActive(false);Destroy(card.gameObject);}cards.Clear();
            bool workshop=tab=="items";
            foreach(var name in new[]{"Laboratory","Overdrive","Guidance"}){var child=Content.GetComponentInParent<SafeArea>().transform.Find(name);if(child!=null)child.gameObject.SetActive(!workshop);}
            Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=1;
            if(workshop){WorkshopView=Instantiate(WorkshopPrefab,Content);WorkshopView.Initialize(this);Refresh();return;}
            int count=tab=="hardware"?Balance.Hardware.Length:tab=="training"?2:Balance.Research.Length;
            for(int i=0;i<count;i++)
            {
                int index=i;var card=Instantiate(CardPrefab,Content);card.gameObject.name=tab+"-"+(tab=="hardware"?Balance.Hardware[i].Id:tab=="training"?(i==0?"quality":"efficiency"):Balance.Research[i].Id);cards.Add(card);
                if(tab=="hardware") {card.Icon.sprite=HardwareSprites[i];card.Button.onClick.AddListener(()=>Act(s=>Game.Buy(s,Balance.Hardware[index].Id)));}
                else {card.Icon.gameObject.SetActive(false);if(tab=="training")card.Button.onClick.AddListener(()=>Act(s=>Game.Train(s,index==0?"quality":"efficiency")));else card.Button.onClick.AddListener(()=>Act(s=>Game.Research(s,Balance.Research[index].Id)));}
            }
            Refresh();
        }
        static string Seconds(double seconds)=>Math.Max(0,seconds).ToString("F0")+" s";
        void Refresh()
        {
            if(State==null)return;
            Credits.text="CREDITS\n"+State.Credits+"  (+"+Game.Income(State)+"/s)";
            Compute.text="COMPUTE\n"+Game.Compute(State);Users.text="NUTZER\n"+Game.Users(State);Data.text="DATEN\n"+State.Data+" (+"+Game.DataRate(State)+"/s)";
            Overdrive.text=State.ActiveUntil>State.SavedAt?"OVERDRIVE ×"+Balance.OverdriveFactor+" · "+Seconds((State.ActiveUntil-State.SavedAt)/1000):"OVERDRIVE  "+State.Charge+" / "+Balance.OverdriveCharge+(State.CooldownUntil>State.SavedAt?" · Pause "+Seconds((State.CooldownUntil-State.SavedAt)/1000):"");
            Status.text=(Writable?"● ":"! ")+message;Status.color=Writable?new Color(.65f,.9f,.8f):new Color(1,.65f,.55f);
            Hint.text=State.Tutorial=="tap"?"Tippe auf das Labor und kaufe deinen ersten Rechner.":State.Tutorial=="training"?"Training: erstes Qualitätstraining kostenlos.":State.Tutorial=="research"?"Forschung: erste Datenerzeugung kostenlos.":"Hardware liefert Compute → Nutzer → Credits und Daten.";
            TapButton.interactable=Writable;SaveButton.interactable=Writable;
            HardwareTab.GetComponentInChildren<Text>().color=tab=="hardware"?Color.white:new Color(.65f,.75f,.8f);TrainingTab.GetComponentInChildren<Text>().color=tab=="training"?Color.white:new Color(.65f,.75f,.8f);ResearchTab.GetComponentInChildren<Text>().color=tab=="research"?Color.white:new Color(.65f,.75f,.8f);
            for(int i=0;i<cards.Count;i++)
            {
                var card=cards[i];
                if(tab=="hardware")
                {
                    var h=Balance.Hardware[i];var cost=Game.HardwareCost(State,i);card.Title.text=h.Name+"  ×"+State.Hardware[i];card.Detail.text="Kaufen: "+cost+" C  ·  +"+ScientificNumber.From(h.Compute)+" Compute";card.Button.interactable=Writable&&State.Credits.CompareTo(cost)>=0;
                }
                else if(tab=="training")
                {
                    string id=i==0?"quality":"efficiency";var cost=Game.TrainingCost(State,id);card.Title.text=(i==0?"Qualität":"Effizienz")+"  Lv. "+(i==0?State.Quality:State.Efficiency);
                    card.Detail.text=State.Training!=null?"Läuft: "+State.Training.id+" · "+Seconds((State.Training.required-State.Training.done)/Game.WorkSpeed(State)):"Start: "+cost+" C · "+Seconds(Game.TrainingWork(State,id)/Game.WorkSpeed(State));card.Button.interactable=Writable&&State.Training==null&&State.Credits.CompareTo(cost)>=0;
                }
                else
                {
                    var r=Balance.Research[i];var block=Game.ResearchBlock(State,i);card.Title.text=r.Name+"  Lv. "+State.Research[i];card.Detail.text=State.ResearchJob?.id==r.Id?"Läuft · "+Seconds((State.ResearchJob.required-State.ResearchJob.done)/(State.ResearchJob.intro?1:Game.WorkSpeed(State,true))):(block??"Start")+" · "+Game.ResearchCost(State,i)+" Daten";card.Button.interactable=Writable&&block==null;
                }
            }
        }
    }
}
