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
        public long PresentationRevision{get;private set;}
        public string CurrentTab=>tab;public string NavigationTab=>tab=="details"?detailKind:tab;EconomyDetailView economyDetail;ProductionView productionView;string detailKind;int detailIndex;
        public bool Writable {get;private set;}
        public string SavePath=>store?.PathName;public AtomicSaveStore Storage=>store;public bool HasReadableState{get;private set;}
        AtomicSaveStore store;string tab="hardware",message="Bereit";bool started,paused,focused=true;LifetimeView lifetimeView;RetentionView retentionView;MissionView missionView;CompanyHubView companyHubView;SeasonView seasonView;MarketView marketView;GemFeatureView gemView;NativeStoreView storeView;AdRewardView adView;SettingsView settingsView;StoryView storyView;GoalView goalView;StorageView storageView;public AppAudio Audio {get;private set;}public LocalDiagnostics Diagnostics{get;private set;}public CrashRecording Crash{get;private set;}
        int researchArea;public void SetResearchArea(int area){researchArea=area;labsOverview?.ShowArea(area);}ResearchLabOverview labsOverview;ShopHub shopHub;Text learningOverview;GameObject queueControls;string queueSignature="";
        int rewardRequestFrame=-1;
        public bool AcquireRewardRequest(){if(rewardRequestFrame==Time.frameCount)return false;rewardRequestFrame=Time.frameCount;return true;}
        long localizedGeneration=-1;
        public ScientificNumber DisplayIncome{get;private set;}=ScientificNumber.Zero;public ScientificNumber DisplayDataRate{get;private set;}=ScientificNumber.Zero;
        float nextRefresh,nextSave;readonly List<ActionCard> cards=new List<ActionCard>();
        static double Now=>DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        void Start()
        {
            Application.targetFrameRate=60;
            store=new AtomicSaveStore(SavePathOverride??Path.Combine(Application.persistentDataPath,"unity-slice-v1.json"),new UnitySaveCodec());
            var loaded=store.Load(Now);Writable=loaded.Writable;HasReadableState=loaded.State!=null;State=loaded.State??Game.New(Now);message=loaded.Message??"Lokal gespeichert";
            double elapsed=Math.Max(0,(Now-State.SavedAt)/1000);var before=State.Credits;
            Diagnostics=State.Journal.diagnostics.Copy();Diagnostics.Loaded(Now);Crash=gameObject.AddComponent<CrashRecording>();Crash.Initialize(this);if(Writable)AdvanceOffline(Now);
            if(elapsed>10&&loaded.State!=null&&Writable)message="Willkommen zurück: +"+State.Credits.Subtract(before)+" Credits (Offline-Limit berücksichtigt)";
            Audio=gameObject.AddComponent<AppAudio>();Audio.Initialize(this);TapButton.transform.parent.gameObject.AddComponent<SignalView>().Initialize(this);TapButton.onClick.AddListener(TapFromUI);
            HardwareTab.onClick.AddListener(()=>UserShow("hardware"));TrainingTab.onClick.AddListener(()=>UserShow("training"));ResearchTab.onClick.AddListener(()=>UserShow("research"));SaveButton.onClick.AddListener(()=>{Tick();Save();Refresh();});
            ItemsTab.onClick.AddListener(()=>{UserShow("items");WorkshopView.ChangeMode("inventory");});PrestigeTab.onClick.AddListener(()=>UserShow("prestige"));var hintButton=Hint.gameObject.AddComponent<Button>();Hint.raycastTarget=true;hintButton.onClick.AddListener(()=>{if(!HasReadableState||!Writable){UserShow("storage");return;}if(State.Story.open!=null||State.Story.target=="name"||State.Story.target=="prologue")UserShow("story");else NavigateGoal(GuidanceRules.Next(State));});var hintLayout=Hint.GetComponent<LayoutElement>();if(hintLayout!=null){hintLayout.minHeight=44;hintLayout.preferredHeight=Math.Max(44,hintLayout.preferredHeight);}GetComponent<MobileShell>()?.Initialize(this);started=true;Show(tab);Save();Refresh();gameObject.AddComponent<MiraPresenter>().Initialize(this);
        }
        void Update()
        {
            if(!started||paused||!focused)return;
            // UTC elapsed time drives the domain; refresh frequency only controls presentation.
            if(Time.unscaledTime>=nextRefresh){Tick();Refresh();nextRefresh=Time.unscaledTime+.1f;}
            if(Time.unscaledTime>=nextSave){Save();nextSave=Time.unscaledTime+5;}
        }
        void LateUpdate(){using(PerformanceMarkers.Localize.Auto()){if(State==null||localizedGeneration==PerformanceMarkers.UiNodes)return;localizedGeneration=PerformanceMarkers.UiNodes;foreach(var text in Content.GetComponentInParent<Canvas>().GetComponentsInChildren<Text>(true))if(text.GetComponent<UiLocalizedText>()==null)text.gameObject.AddComponent<UiLocalizedText>().Initialize(this);}}
        void Tick(bool active=true){using(PerformanceMarkers.Tick.Auto()){if(!active){if(Writable)AdvanceOffline(Now);return;}if(!Writable)return;var before=State;var watch=System.Diagnostics.Stopwatch.StartNew();try{double mark=Crash.Ledger.Begin("ticks","simulation",Now,State.Meta.resets+":"+State.Prestige.resets);double now=Now;if(now<State.SavedAt)Diagnostics.discardedTicks++;long resets=State.Prestige.resets,axioms=State.Meta.resets;int ledger=State.Retention.ledger.Length;State=NarrativeBridge.Sync(State,Game.Advance(State,now,active&&!paused&&focused));Diagnostics.Tick(Now,watch.Elapsed.TotalMilliseconds);Crash.Ledger.End("ticks","simulation",mark,Now,watch.Elapsed.TotalMilliseconds,watch.Elapsed.TotalMilliseconds>JournalCatalog.SlowOperationMilliseconds?"slow":"ok");if(watch.Elapsed.TotalMilliseconds>JournalCatalog.SlowOperationMilliseconds)Crash.Ledger.Failure("slow-simulation-tick","Simulation tick "+watch.Elapsed.TotalMilliseconds.ToString("F1")+" ms","",Now);Diagnostics.Research("active",State.Lifetime.researchCompleted-before.Lifetime.researchCompleted);if(State.Prestige.resets!=resets||State.Meta.resets!=axioms||State.Retention.ledger.Length!=ledger){Save();if(!Writable)State=before;}if(Writable&&active&&!paused&&focused)Audio?.Feedback("foreground-tick",before,State);}catch(Exception error){State=before;Crash?.Ledger.Failure("unhandled-exception",error.Message,error.StackTrace,Now);Diagnostics.simulationErrors++;Diagnostics.lastWarning=error.Message;Writable=false;message="Simulation gesperrt: "+error.Message;Debug.LogWarning(message);}}}
        void AdvanceOffline(double now){var before=State;var measured=Game.AdvanceMeasured(before,now);var capture=measured.Report;var next=NarrativeBridge.Sync(before,measured.State);if(ReferenceEquals(next,before))return;ReturnReceipt.Attach(before,next,capture);Diagnostics.Research("offline",next.Lifetime.researchCompleted-before.Lifetime.researchCompleted);next.Journal.diagnostics=Diagnostics.Copy();var writeWatch=System.Diagnostics.Stopwatch.StartNew();try{store.Save(next);Diagnostics.Saved(Now,writeWatch.Elapsed.TotalMilliseconds,new FileInfo(SavePath).Length);State=next;HasReadableState=true;}catch(Exception e){Crash?.Ledger.Failure("save-failed",e.Message,e.StackTrace,Now);Diagnostics.saveErrors++;Diagnostics.lastWarning=e.Message;Writable=false;State=before;message="Speichern gesperrt: "+e.Message;Debug.LogWarning(message);}}
        public void RecoverSave(string source,string hash){WorkshopView?.Forge.Cancel();PrestigeView?.Cancel();ModelsView?.Cancel();State=store.Recover(source,hash);Diagnostics=State.Journal.diagnostics.Copy();Diagnostics.Loaded(Now);Diagnostics.recoveries++;Writable=HasReadableState=true;AdvanceOffline(Now);Show("storage");Refresh();}
        public void StartNewCampaign(){if(!Writable||ChallengeRules.Active(State))return;Tick();Save();if(!Writable)return;string directory=Path.Combine(Path.GetDirectoryName(SavePath),"CampaignOriginals");Directory.CreateDirectory(directory);string original=Path.Combine(directory,"previous-campaign-"+Guid.NewGuid().ToString("N")+".json");store.Export(State,original);var fresh=Game.New(Now,Guid.NewGuid().ToString("N"),true);string candidate=Path.Combine(directory,"new-campaign-"+Guid.NewGuid().ToString("N")+".json");store.Export(fresh,candidate);var inspected=store.Inspect(candidate);if(!inspected.Valid)throw new InvalidDataException(inspected.Message);RecoverSave(candidate,inspected.Hash);}
        void TapFromUI(){ScientificNumber gain=ScientificNumber.Zero;bool activated=false;bool accepted=Act(s=>{var next=Game.Tap(s,s.SavedAt);gain=next.Credits.Subtract(s.Credits);activated=next.Overdrives>s.Overdrives;return next;},"tap");if(accepted){TapButton.GetComponent<LabFeedback>()?.Receipt("+"+NumberFormatting.Format(gain,State.Settings.numberFormat),activated);Audio?.Play(activated?"unlock":"ui-click");}}
        public bool Act(Func<GameState,GameState> action,string actionName="action")
        {
            if(!Writable)return false;Audio?.Unlock();Tick();if(!Writable){Refresh();return false;}var before=State;double actionMark=Crash.Ledger.Begin("actions",actionName,Now,State.Meta.resets+":"+State.Prestige.resets);var actionWatch=System.Diagnostics.Stopwatch.StartNew();State=NarrativeBridge.Sync(before,action(State));
            if(!ReferenceEquals(before,State)) {PresentationRevision++;Diagnostics.Research("action:"+actionName,State.Lifetime.researchCompleted-before.Lifetime.researchCompleted);message="Aktion gespeichert";Save();if(!Writable)State=before;}Crash.Ledger.End("actions",actionName,actionMark,Now,actionWatch.Elapsed.TotalMilliseconds,Writable?"ok":"save-blocked");if(Writable)Audio?.Feedback(actionName,before,State);Refresh();if(Writable&&!ReferenceEquals(before,State))GetComponent<RewardPresentation>()?.Receipt(before,State,actionName);GetComponent<RewardPresentation>()?.ClearOrigin();return !ReferenceEquals(before,State)&&Writable;
        }
        void Save()
        {using(PerformanceMarkers.Save.Auto()){
            if(!Writable||State==null||store==null)return;
            double mark=Crash.Ledger.Begin("saves","save",Now,State.Meta.resets+":"+State.Prestige.resets);var writeWatch=System.Diagnostics.Stopwatch.StartNew();try{var candidate=State.Copy();candidate.Journal.diagnostics=Diagnostics.Copy();store.Save(candidate);State=candidate;Diagnostics.Saved(Now,writeWatch.Elapsed.TotalMilliseconds,new FileInfo(SavePath).Length);Crash.Ledger.End("saves","save",mark,Now,writeWatch.Elapsed.TotalMilliseconds,size:Diagnostics.lastSaveBytes);if(writeWatch.Elapsed.TotalMilliseconds>JournalCatalog.SlowOperationMilliseconds)Crash.Ledger.Failure("long-save","Save took "+writeWatch.Elapsed.TotalMilliseconds.ToString("F1")+" ms","",Now);}catch(Exception e){Crash?.Ledger.Failure("save-failed",e.Message,e.StackTrace,Now);Diagnostics.saveErrors++;Diagnostics.lastWarning=e.Message;Writable=false;message="Speichern gesperrt: "+e.Message;Debug.LogWarning(message);}
        }}
        void OnApplicationPause(bool value)
        {
            if(!started)return;
            if(value){WorkshopView?.Forge.Cancel();PrestigeView?.Cancel();ModelsView?.Cancel();Tick();Save();paused=true;}else{paused=false;Tick(false);Save();Refresh();}
        }
        void OnApplicationFocus(bool focused){if(!started)return;if(focused){Tick(false);this.focused=true;Save();Refresh();}else{WorkshopView?.Forge.Cancel();PrestigeView?.Cancel();ModelsView?.Cancel();Tick();this.focused=false;Save();}}
        void OnApplicationQuit(){Tick();Save();}
        void OnDestroy(){if(started){Tick();Save();}}
        public void UserShow(string selected){Audio?.Unlock();Audio?.Play("ui-click");Show(selected);}
        public void ShowDetails(string kind,int index){detailKind=kind;detailIndex=index;Show("details");}
        public void Show(string selected)
        {
            if(labsOverview!=null){labsOverview.gameObject.SetActive(false);Destroy(labsOverview.gameObject);labsOverview=null;}if(shopHub!=null){shopHub.gameObject.SetActive(false);Destroy(shopHub.gameObject);shopHub=null;}learningOverview=null;foreach(Transform heading in Content)if(heading.name=="LearningOverview"){heading.gameObject.SetActive(false);Destroy(heading.gameObject);}
            GetComponent<RewardPresentation>()?.Cancel();var menuReturn=Content.Find("MenuReturn");if(menuReturn!=null){menuReturn.gameObject.SetActive(false);Destroy(menuReturn.gameObject);}
            if(productionView!=null){productionView.gameObject.SetActive(false);Destroy(productionView.gameObject);productionView=null;}if(economyDetail!=null){economyDetail.gameObject.SetActive(false);Destroy(economyDetail.gameObject);economyDetail=null;}foreach(Transform child in Content)if(child.name.StartsWith("Details-",StringComparison.Ordinal)){child.gameObject.SetActive(false);Destroy(child.gameObject);}
            var oldProduction=Content.Find("ProductionAccess");if(oldProduction!=null){oldProduction.gameObject.SetActive(false);Destroy(oldProduction.gameObject);}
            if(goalView!=null){goalView.gameObject.SetActive(false);Destroy(goalView.gameObject);goalView=null;}var oldGoals=Content.Find("GoalsAccess");if(oldGoals!=null){oldGoals.gameObject.SetActive(false);Destroy(oldGoals.gameObject);}
            if(storageView!=null){storageView.gameObject.SetActive(false);Destroy(storageView.gameObject);storageView=null;}var oldStorage=Content.Find("StorageAccess");if(oldStorage!=null){oldStorage.gameObject.SetActive(false);Destroy(oldStorage.gameObject);}
            if(storyView!=null){storyView.gameObject.SetActive(false);Destroy(storyView.gameObject);storyView=null;}var oldStory=Content.Find("StoryAccess");if(oldStory!=null){oldStory.gameObject.SetActive(false);Destroy(oldStory.gameObject);}
            if(settingsView!=null){settingsView.gameObject.SetActive(false);Destroy(settingsView.gameObject);settingsView=null;}var oldSettings=Content.Find("SettingsAccess");if(oldSettings!=null){oldSettings.gameObject.SetActive(false);Destroy(oldSettings.gameObject);}
            if(adView!=null){adView.gameObject.SetActive(false);Destroy(adView.gameObject);adView=null;}var oldAds=Content.Find("AdAccess");if(oldAds!=null){oldAds.gameObject.SetActive(false);Destroy(oldAds.gameObject);}
            if(storeView!=null){storeView.gameObject.SetActive(false);Destroy(storeView.gameObject);storeView=null;}var oldStore=Content.Find("StoreAccess");if(oldStore!=null){oldStore.gameObject.SetActive(false);Destroy(oldStore.gameObject);}
            if(gemView!=null){gemView.gameObject.SetActive(false);Destroy(gemView.gameObject);gemView=null;}var oldGems=Content.Find("GemAccess");if(oldGems!=null){oldGems.gameObject.SetActive(false);Destroy(oldGems.gameObject);}
            if(marketView!=null){marketView.gameObject.SetActive(false);Destroy(marketView.gameObject);marketView=null;}var oldMarket=Content.Find("MarketAccess");if(oldMarket!=null){oldMarket.gameObject.SetActive(false);Destroy(oldMarket.gameObject);}
            if(seasonView!=null){seasonView.gameObject.SetActive(false);Destroy(seasonView.gameObject);seasonView=null;}var oldSeason=Content.Find("SeasonAccess");if(oldSeason!=null){oldSeason.gameObject.SetActive(false);Destroy(oldSeason.gameObject);}
            if(missionView!=null){missionView.gameObject.SetActive(false);Destroy(missionView.gameObject);missionView=null;}var oldMissions=Content.Find("MissionsAccess");if(oldMissions!=null){oldMissions.gameObject.SetActive(false);Destroy(oldMissions.gameObject);}
            if(retentionView!=null){retentionView.gameObject.SetActive(false);Destroy(retentionView.gameObject);retentionView=null;}if(companyHubView!=null){companyHubView.gameObject.SetActive(false);Destroy(companyHubView.gameObject);companyHubView=null;}var oldProfile=Content.Find("ProfileAccess");if(oldProfile!=null){oldProfile.gameObject.SetActive(false);Destroy(oldProfile.gameObject);}
            if(lifetimeView!=null){lifetimeView.gameObject.SetActive(false);Destroy(lifetimeView.gameObject);lifetimeView=null;}var oldProgress=Content.Find("ProgressAccess");if(oldProgress!=null){oldProgress.gameObject.SetActive(false);Destroy(oldProgress.gameObject);}
            if(ChallengeView!=null){Destroy(ChallengeView.gameObject);ChallengeView=null;}
            if(queueControls!=null){queueControls.SetActive(false);Destroy(queueControls);queueControls=null;}queueSignature="";
            if(ModelsView!=null){ModelsView.Cancel();Destroy(ModelsView.gameObject);ModelsView=null;}if(PrestigeView!=null){PrestigeView.Cancel();Destroy(PrestigeView.gameObject);PrestigeView=null;}if(WorkshopView!=null){Destroy(WorkshopView.gameObject);WorkshopView=null;}
            var oldChallenge=Content.Find("ChallengesAccess");if(oldChallenge!=null){oldChallenge.gameObject.SetActive(false);Destroy(oldChallenge.gameObject);}var oldLab=Content.Find("SecretLab");if(oldLab!=null){oldLab.gameObject.SetActive(false);Destroy(oldLab.gameObject);}tab=selected;foreach(var card in cards){card.gameObject.SetActive(false);Destroy(card.gameObject);}cards.Clear();
            bool workshop=tab=="shop"||tab=="production"||tab=="details"||tab=="items"||tab=="prestige"||tab=="models"||tab=="challenges"||tab=="progress"||tab=="profile"||tab=="company"||tab=="missions"||tab=="seasons"||tab=="market"||tab=="gems"||tab=="store"||tab=="ads"||tab=="settings"||tab=="story"||tab=="storage"||tab=="goals";
            if(GetComponent<MobileShell>()==null)foreach(var name in new[]{"Laboratory","Overdrive","Guidance"}){var child=Content.GetComponentInParent<SafeArea>().transform.Find(name);if(child!=null)child.gameObject.SetActive(!workshop);}
            Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=1;
            if(tab=="shop"){shopHub=WorkshopUIFactory.Vertical("ShopHub",Content).AddComponent<ShopHub>();shopHub.Initialize(this);Refresh();return;}
            if(tab=="production"){productionView=WorkshopUIFactory.Vertical("Production",Content).AddComponent<ProductionView>();productionView.Initialize(this);Refresh();return;}
            if(tab=="details"){economyDetail=WorkshopUIFactory.Vertical("EconomyDetail",Content).AddComponent<EconomyDetailView>();economyDetail.Initialize(this,detailKind,detailIndex);Refresh();return;}
            if(tab=="goals"){goalView=WorkshopUIFactory.Vertical("Goals",Content).AddComponent<GoalView>();goalView.Initialize(this);Refresh();return;}
            if(tab=="storage"){storageView=WorkshopUIFactory.Vertical("Storage",Content).AddComponent<StorageView>();storageView.Initialize(this);Refresh();return;}
            if(tab=="story"){storyView=WorkshopUIFactory.Vertical("MiraStory",Content).AddComponent<StoryView>();storyView.Initialize(this);Refresh();return;}
            if(tab=="settings"){settingsView=WorkshopUIFactory.Vertical("Settings",Content).AddComponent<SettingsView>();settingsView.Initialize(this);Refresh();return;}
            if(tab=="ads"){adView=WorkshopUIFactory.Vertical("AdRewards",Content).AddComponent<AdRewardView>();adView.Initialize(this);Refresh();return;}
            if(tab=="store"){storeView=WorkshopUIFactory.Vertical("NativeStore",Content).AddComponent<NativeStoreView>();storeView.Initialize(this);Refresh();return;}
            if(tab=="gems"){gemView=WorkshopUIFactory.Vertical("GemFeatures",Content).AddComponent<GemFeatureView>();gemView.Initialize(this);Refresh();return;}
            if(tab=="market"){Act(Market.Visit);marketView=WorkshopUIFactory.Vertical("Market",Content).AddComponent<MarketView>();marketView.Initialize(this);Refresh();return;}
            if(tab=="seasons"){seasonView=WorkshopUIFactory.Vertical("Seasons",Content).AddComponent<SeasonView>();seasonView.Initialize(this);Refresh();return;}
            if(tab=="missions"){missionView=WorkshopUIFactory.Vertical("Missions",Content).AddComponent<MissionView>();missionView.Initialize(this);Refresh();return;}
            if(tab=="profile"){retentionView=WorkshopUIFactory.Vertical("Profile",Content).AddComponent<RetentionView>();retentionView.Initialize(this);Refresh();return;}
            if(tab=="company"){companyHubView=WorkshopUIFactory.Vertical("CompanyHub",Content).AddComponent<CompanyHubView>();companyHubView.Initialize(this);Refresh();return;}
            if(tab=="progress"){lifetimeView=WorkshopUIFactory.Vertical("Lifetime",Content).AddComponent<LifetimeView>();lifetimeView.Initialize(this);Refresh();return;}
            if(tab=="challenges"){ChallengeView=WorkshopUIFactory.Vertical("Challenges",Content).AddComponent<ChallengeUI>();ChallengeView.Initialize(this);Refresh();return;}
            if(tab=="models"){ModelsView=Instantiate(ModelPrefab,Content);ModelsView.Initialize(this);Refresh();return;}

            if(tab=="prestige"){PrestigeView=Instantiate(PrestigePrefab,Content);PrestigeView.Initialize(this);Refresh();return;}
            if(workshop){WorkshopView=Instantiate(WorkshopPrefab,Content);WorkshopView.Initialize(this);Refresh();return;}
            if(tab=="research"){labsOverview=WorkshopUIFactory.Vertical("ResearchLabs",Content).AddComponent<ResearchLabOverview>();labsOverview.Initialize(this);}
            if(tab=="training")learningOverview=WorkshopUIFactory.Label("LearningOverview",Content,tab=="training"?"Training":"Forschung",18,tab=="research"?48:34);
            int count=tab=="hardware"?Balance.Hardware.Length:tab=="training"?3:Balance.Research.Length;
            for(int i=0;i<count;i++)
            {
                int index=i;var card=Instantiate(tab=="hardware"?CardPrefab:Resources.Load<ActionCard>("PixelUI/LearningCard"),Content);card.gameObject.name=tab+"-"+(tab=="hardware"?Balance.Hardware[i].Id:tab=="training"?PrestigeAutomation.Tracks[i]:Balance.Research[i].Id);cards.Add(card);
                if(tab=="hardware") {card.Icon.sprite=HardwareSprites[i];card.gameObject.AddComponent<HardwarePresentation>().Initialize(this,i);card.Button.onClick.AddListener(()=>Act(s=>Game.Buy(s,Balance.Hardware[index].Id,SettingsRules.BuyQuantity(s,index)),"buy-class"));}
                else {if(tab=="training")card.Button.onClick.AddListener(()=>Act(s=>Game.Train(s,PrestigeAutomation.Tracks[index]),"train"));else card.Button.onClick.AddListener(()=>Act(s=>Game.Research(s,Balance.Research[index].Id),"research-project"));card.GetComponent<LearningCard>().Initialize(this,tab,i);}

            }
            if(tab=="research"){labsOverview.Bind(cards.ToArray(),researchArea);var lab=WorkshopUIFactory.Button("SecretLab",Content,"Geheimes Labor · KI-Modelle",()=>UserShow("models"));lab.gameObject.SetActive(State.Prestige.lab);lab.interactable=Writable&&State.Prestige.lab;}
            Refresh();
        }
        public void NavigateGoal(GoalQuote quote){if(quote==null)return;NavigateTo(quote.Tab,quote.Element??"",quote.Mode??"");if(quote.Kind=="prestige"&&PrestigeView!=null)PrestigeView.OpenNode(NavigationCatalog.LegacyNodes.TryGetValue(quote.Id,out var mapped)?mapped:quote.Id);if(quote.Kind=="item-upgrade"&&WorkshopView!=null)WorkshopView.OpenItem(quote.Id);}
        public void NavigateTo(string selected,string element,string mode=""){Show(selected);if(selected=="research"&&element.StartsWith("research-",StringComparison.Ordinal))SetResearchArea(Workshop.ResearchArea(element.Substring(9)));if(WorkshopView!=null&&mode.Length>0)WorkshopView.ChangeMode(mode);StartCoroutine(FocusTarget(element));}
        System.Collections.IEnumerator FocusTarget(string name){yield return null;Canvas.ForceUpdateCanvases();var target=GameObject.Find(name);if(target==null)yield break;var selectable=target.GetComponentInChildren<Selectable>();if(selectable!=null&&UnityEngine.EventSystems.EventSystem.current!=null)UnityEngine.EventSystems.EventSystem.current.SetSelectedGameObject(selectable.gameObject);if(target.transform.IsChildOf(Content)){var scroll=Content.GetComponentInParent<ScrollRect>();var targetRect=learningOverview!=null&&cards.Count>0&&target==cards[0].gameObject?learningOverview.rectTransform:(RectTransform)target.transform;float low=scroll.viewport.InverseTransformPoint(targetRect.TransformPoint(new Vector3(0,targetRect.rect.yMin,0))).y,high=scroll.viewport.InverseTransformPoint(targetRect.TransformPoint(new Vector3(0,targetRect.rect.yMax,0))).y;if(low>=scroll.viewport.rect.yMin&&high<=scroll.viewport.rect.yMax)yield break;var rect=(RectTransform)Content;var bounds=RectTransformUtility.CalculateRelativeRectTransformBounds(rect,targetRect);float range=rect.rect.height-scroll.viewport.rect.height;if(range>0)scroll.verticalNormalizedPosition=1-Mathf.Clamp01(-bounds.max.y/range);}}
        void RefreshQueues()
        {
            if(tab!="training"&&tab!="research")return;string signature=tab+string.Join(",",State.Prestige.trainingQueue.Select(j=>j.track+":"+j.level))+string.Join(",",State.Prestige.researchQueue);if(signature==queueSignature)return;queueSignature=signature;if(queueControls!=null){queueControls.SetActive(false);Destroy(queueControls);}queueControls=WorkshopUIFactory.Vertical("UnpaidQueues",Content);queueControls.transform.SetSiblingIndex(Math.Min(1,Content.childCount-1));
            if(tab=="training")for(int i=0;i<State.Prestige.trainingQueue.Length;i++){int index=i;var job=State.Prestige.trainingQueue[i];WorkshopUIFactory.Button("CancelTrainingQueue"+i,queueControls.transform,"Wartend: "+(job.track=="integration"?"Integration":SettingsRules.Text(State.Settings.language,"workshop:"+job.track))+" → "+job.level+" · entfernen",()=>Act(s=>{var n=s.Copy();string track=n.Prestige.trainingQueue[index].track;n.Prestige.trainingQueue=n.Prestige.trainingQueue.Where((j,k)=>k<index||j.track!=track).ToArray();return n;}));}
            if(tab=="research")for(int i=0;i<State.Prestige.researchQueue.Length;i++){int index=i;string id=State.Prestige.researchQueue[i];WorkshopUIFactory.Button("CancelResearchQueue"+i,queueControls.transform,"Wartend: "+SettingsRules.Text(State.Settings.language,"research:"+id)+" · entfernen",()=>Act(s=>{var n=s.Copy();n.Prestige.researchQueue=n.Prestige.researchQueue.Where((j,k)=>k!=index).ToArray();return n;}));}
        }
        static string Seconds(double seconds)=>Math.Max(0,seconds).ToString("F0")+" s";
        void Refresh()
        {using(PerformanceMarkers.Refresh.Auto()){
            if(State==null)return;GetComponent<MobileShell>()?.RefreshNavigation();RefreshQueues();if(learningOverview!=null){bool de=State.Settings.language=="de";learningOverview.text=tab=="research"?(de?"Forschung\n<size=12>Labore ":"Research\n<size=12>Labs ")+PrestigeAutomation.ResearchJobs(State).Count()+" / "+PrestigeAutomation.LabCount(State)+" · "+State.Prestige.researchQueue.Length+(de?" wartend</size>":" queued</size>"):(de?"Training":"Training");}if(tab=="research"){var access=Content.Find("ChallengesAccess")?.GetComponent<Button>();if(access!=null)access.GetComponentInChildren<Text>().text=ChallengeRules.Active(State)?"Aktive Challenge · zurückkehren":"Challenges · 10 Familien / 69 Stufen";var lab=Content.Find("SecretLab")?.GetComponent<Button>();if(lab!=null){lab.gameObject.SetActive(State.Prestige.lab);lab.interactable=Writable&&State.Prestige.lab;lab.GetComponentInChildren<Text>().text=State.Prestige.lab?"Geheimes Labor · KI-Modelle":"Geheimes Labor · "+State.Prestige.Total+" / "+PrestigeRules.V("labThreshold")+" Gesamt-INT";}}
            var rates=Game.ViewRates(State);DisplayIncome=rates.Income;DisplayDataRate=rates.Data;
            string language=State.Settings.language,format=State.Settings.numberFormat;
            if(GetComponent<MobileShell>()!=null){Credits.text=HasReadableState?NumberFormatting.Format(State.Credits,format):"—";Data.text=HasReadableState?NumberFormatting.Format(State.Data,format):"—";Compute.text=HasReadableState?NumberFormatting.Format(rates.Compute,format):"—";Users.text=HasReadableState?NumberFormatting.Format(ScientificNumber.From(State.Retention.gems),format):"—";}
            else {Credits.text=SettingsRules.Text(language,"workshop:credits")+"\n"+NumberFormatting.Format(State.Credits,format)+" (+"+NumberFormatting.Format(rates.Income,format)+"/s)";Data.text=SettingsRules.Text(language,"workshop:data")+"\n"+NumberFormatting.Format(State.Data,format)+" (+"+NumberFormatting.Format(rates.Data,format)+"/s)";Compute.text=SettingsRules.Text(language,"workshop:compute")+"\n"+NumberFormatting.Format(rates.Compute,format);Users.text=SettingsRules.Text(language,"workshop:users")+"\n"+NumberFormatting.Format(rates.Users,format);}
            Overdrive.text=State.ActiveUntil>State.SavedAt?"OVERDRIVE ×"+Game.OverdriveFactor(State)+" · "+Seconds((State.ActiveUntil-State.SavedAt)/1000):"OVERDRIVE  "+State.Charge+" / "+Balance.OverdriveCharge+(State.CooldownUntil>State.SavedAt?" · Pause "+Seconds((State.CooldownUntil-State.SavedAt)/1000):"");
            if(!Writable&&tab!="storage"){foreach(var control in Content.GetComponentsInChildren<Button>())control.interactable=false;var recovery=Content.Find("StorageAccess")?.GetComponent<Button>();if(recovery!=null)recovery.interactable=true;}Status.text=(State.Legacy.prepared?"PREPARED TEST SAVE · ":"")+(ChallengeRules.Active(State)?"CHALLENGE · Hauptspiel pausiert · ":"")+(Writable?"● ":"! ")+message;Status.transform.parent.gameObject.SetActive(!Writable||State.Legacy.prepared||ChallengeRules.Active(State));Status.color=Writable?new Color(.65f,.9f,.8f):new Color(1,.65f,.55f);
            Hint.text=State.Story.open!=null?"Mira · "+(State.Settings.language=="de"?"Dialog öffnen":"Open dialogue"):State.Story.target=="name"?"Mira · "+(State.Settings.language=="de"?"KI benennen · hier öffnen":"Name your AI · open here"):State.Meta.tutorial=="lab"?"Mira: Geheimes Labor freigeschaltet! Öffne Forschung → KI-Modelle.":State.Prestige.resets>0?"INT verstärkt die Produktion. Knoten und Automation im INT-Netz.":State.Tutorial=="tap"?"Tippe auf das Labor und kaufe deinen ersten Rechner.":State.Tutorial=="training"?"Training: erstes Qualitätstraining kostenlos.":State.Tutorial=="research"?"Forschung: erste Datenerzeugung kostenlos.":"Hardware liefert Compute → Nutzer → Credits und Daten.";
            if(State.Story.open==null&&State.Story.tutorial!="active"){var goal=GuidanceRules.Next(State);Hint.text=goal.Title+" · "+goal.Progress;}
            if(!HasReadableState){Credits.text=SettingsRules.Text(language,"workshop:credits")+"\n—";Compute.text=SettingsRules.Text(language,"workshop:compute")+"\n—";Users.text=SettingsRules.Text(language,"workshop:users")+"\n—";Data.text=SettingsRules.Text(language,"workshop:data")+"\n—";Overdrive.text="—";Hint.text="Original save unreadable · open Recovery";}
            TapButton.interactable=Writable&&!ChallengeRules.Is(State,"no-taps");SaveButton.interactable=Writable;
            HardwareTab.GetComponentInChildren<Text>().color=tab=="hardware"?Color.white:new Color(.65f,.75f,.8f);TrainingTab.GetComponentInChildren<Text>().color=tab=="training"?Color.white:new Color(.65f,.75f,.8f);ResearchTab.GetComponentInChildren<Text>().color=tab=="research"?Color.white:new Color(.65f,.75f,.8f);
            for(int i=0;i<cards.Count;i++)
            {
                var card=cards[i];
                if(tab=="hardware")
                {
                    card.GetComponent<HardwarePresentation>().RefreshView();
                }
                else if(card.gameObject.activeInHierarchy)card.GetComponent<LearningCard>().RefreshView();
            }
        }}
    }
}
