using System;
using System.Linq;
using System.Collections.Generic;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
    public static class WorkshopUIFactory
    {
        public static Font Font=>Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        public static GameObject Node(string name,Transform parent,params Type[] types){var g=new GameObject(name,typeof(RectTransform));g.transform.SetParent(parent,false);foreach(var t in types)g.AddComponent(t);return g;}
        public static void Fill(RectTransform r){r.anchorMin=Vector2.zero;r.anchorMax=Vector2.one;r.offsetMin=r.offsetMax=Vector2.zero;}
        public static void Size(GameObject g,float h){var l=g.AddComponent<LayoutElement>();l.minHeight=h;l.preferredHeight=h;l.flexibleHeight=0;}
        public static Text Label(string name,Transform parent,string value,int size=14,float height=32){var g=Node(name,parent,typeof(Text));var t=g.GetComponent<Text>();t.font=Font;t.text=value;t.color=new Color(.9f,.95f,1);t.fontSize=size;t.alignment=TextAnchor.MiddleLeft;t.raycastTarget=false;Size(g,height);return t;}
        public static Button Button(string name,Transform parent,string value,Action action){var g=Node(name,parent,typeof(Image),typeof(Button));g.GetComponent<Image>().color=new Color(.12f,.32f,.33f);Size(g,54);var text=Label("Label",g.transform,value);UnityEngine.Object.DestroyImmediate(text.GetComponent<LayoutElement>());Fill(text.rectTransform);text.alignment=TextAnchor.MiddleCenter;var b=g.GetComponent<Button>();if(action!=null)b.onClick.AddListener(()=>action());return b;}
        public static GameObject Vertical(string name,Transform parent){var g=Node(name,parent);var l=g.AddComponent<VerticalLayoutGroup>();l.spacing=7;l.childControlWidth=l.childControlHeight=true;l.childForceExpandWidth=true;l.childForceExpandHeight=false;return g;}
        public static GameObject Horizontal(string name,Transform parent,float height=54){var g=Node(name,parent);Size(g,height);var l=g.AddComponent<HorizontalLayoutGroup>();l.spacing=6;l.childControlWidth=l.childControlHeight=true;l.childForceExpandWidth=true;l.childForceExpandHeight=true;return g;}
        public static void Clear(Transform parent){foreach(Transform child in parent){child.gameObject.SetActive(false);UnityEngine.Object.Destroy(child.gameObject);}}
    }
    public sealed class WorkshopUI:MonoBehaviour
    {
        public ItemPortrait PortraitPrefab;public ActionCard RowPrefab;public ForgeAnimator Forge;public Sprite[] ItemSprites,ComponentSprites;public Transform Rows,Equipment;public Text RecipeTitle,Cost,Stock;public Button Primary,Info,Motion;public GameObject ForgePanel,DetailRoot;public ItemPortrait DetailPortrait;public Text DetailText;public Transform DetailActions;
        GameRuntime game;int recipe,quantity=1;Button batch;string mode="blueprints";readonly List<string> selection=new List<string>();long lastRevision=-1;double lastData;int lastInventory;
        public string Mode=>mode;public string[] Selection=>selection.ToArray();public GameRuntime Runtime=>game;
        public void Initialize(GameRuntime runtime){game=runtime;DetailRoot.transform.SetParent(GetComponentInParent<Canvas>().transform,false);WorkshopUIFactory.Fill((RectTransform)DetailRoot.transform);DetailRoot.AddComponent<SafeArea>();DetailRoot.SetActive(false);ItemPortrait.Sprites=ItemSprites;Primary.onClick.AddListener(Commit);Info.onClick.AddListener(()=>OpenRecipe(recipe));Motion.onClick.AddListener(()=>{game.Act(v=>{var next=v.Copy();next.Workshop.reducedMotion=!next.Workshop.reducedMotion;return next;});Forge.SetReduced(game.State.Workshop.reducedMotion);UpdateView(true);});transform.Find("WorkshopTabs/Blueprints").GetComponent<Button>().onClick.AddListener(()=>ChangeMode("blueprints"));transform.Find("WorkshopTabs/Inventory").GetComponent<Button>().onClick.AddListener(()=>ChangeMode("inventory"));transform.Find("WorkshopTabs/Materials").GetComponent<Button>().onClick.AddListener(()=>ChangeMode("components"));transform.Find("WorkshopOptions/FusionMode").GetComponent<Button>().onClick.AddListener(()=>ChangeMode("fusion"));DetailRoot.transform.Find("DetailPanel/CloseItemDetail").GetComponent<Button>().onClick.AddListener(CloseDetail);batch=WorkshopUIFactory.Button("BatchQuantity",transform.Find("WorkshopOptions"),"×1",()=>{int[] choices={1,3,10,100};quantity=choices[(Array.IndexOf(choices,quantity)+1)%choices.Length];UpdateView(true);});UpdateView(true);}
        void OnDestroy(){if(DetailRoot!=null)Destroy(DetailRoot);}
        void OnDisable(){Forge?.Cancel();if(DetailRoot!=null)DetailRoot.SetActive(false);}
        void Update(){if(game!=null)UpdateView(false);}
        public void ChangeMode(string next){Forge.Cancel();mode=next;selection.Clear();CloseDetail();UpdateView(true);}
        public void SelectRecipe(int n){Forge.Cancel();recipe=n;mode="blueprints";selection.Clear();UpdateView(true);}
        public void ToggleSelection(string id){Forge.Cancel();if(selection.Contains(id))selection.Remove(id);else if(selection.Count<3)selection.Add(id);mode="fusion";UpdateView(true);}
        ItemInstance Item(string id)=>game.State.Workshop.inventory.FirstOrDefault(i=>i.id==id);
        public void Commit()
        {
            var scroll=GetComponentInParent<ScrollRect>();if(scroll!=null){scroll.verticalNormalizedPosition=1;Canvas.ForceUpdateCanvases();}
            var s=game.State;long ticket=s.Workshop.revision;
            if(mode=="fusion")
            {
                var ids=selection.ToArray();var result=Workshop.FusionResult(s,ids);if(result==null)return;var inputs=ids.Select(id=>Item(id).Copy()).ToArray();if(game.Act(v=>v.Workshop.revision==ticket?Workshop.Fuse(v,ids):v)){selection.Clear();UpdateView(true);Forge.Play(inputs,Array.Empty<int>(),result,s.Workshop.reducedMotion);}
            }
            else
            {
                string type=ItemBalance.Items[recipe].Id;if(!s.Workshop.learned[recipe]){game.Act(v=>Workshop.Learn(v,type));UpdateView(true);return;}
                var q=Workshop.Quote(s,type);if(!q.Allowed)return;var components=q.Components.Select((amount,index)=>new{amount,index}).Where(c=>c.amount>0).Select(c=>c.index).ToArray();
                if(game.Act(v=>v.Workshop.revision==ticket?Workshop.CraftBatch(v,type,quantity):v)){var result=game.State.Workshop.inventory.Last().Copy();UpdateView(true);Forge.Play(Array.Empty<ItemInstance>(),components,result,s.Workshop.reducedMotion);}
            }
        }
        void UpdateView(bool force)
        {
            var s=game.State;var w=s.Workshop;bool stockChanged=w.revision!=lastRevision||w.inventory.Length!=lastInventory;double amount=s.Data.ToDouble();bool dataChanged=Math.Abs(amount-lastData)>=1;
            if(!force&&!stockChanged&&!dataChanged)return;lastRevision=w.revision;lastData=amount;lastInventory=w.inventory.Length;
            selection.RemoveAll(id=>Item(id)==null);Motion.GetComponentInChildren<Text>().text=w.reducedMotion?"Bewegung aus":"Bewegung an";ForgePanel.SetActive(mode=="blueprints"||mode=="fusion");Equipment.gameObject.SetActive(mode=="inventory");
            if(batch!=null){batch.GetComponentInChildren<Text>().text="×"+quantity;batch.interactable=PrestigeRules.Has(s,"W07");}Stock.text="Komponenten "+w.components.Sum()+"   ·   Bauplanfragmente "+w.fragments;
            if(!Forge.IsAnimating)
            {
                for(int i=0;i<3;i++)Forge.Inputs[i].Bind(mode=="fusion"&&selection.Count>i?Item(selection[i]):null,null,mode=="fusion"?"+":"Material");
            }
            if(mode=="fusion")
            {
                var result=Workshop.FusionResult(s,selection.ToArray());RecipeTitle.text="Fusion · drei gleiche Items";Cost.text=result==null?"Gleicher Typ + Seltenheit · ungeschützt und abgelegt":"Ergebnis: "+Workshop.Definition(result).Name+" · Lv. "+result.level+" · "+ItemBalance.Rarities[result.rarity];Primary.GetComponentInChildren<Text>().text="Sofort fusionieren";Primary.interactable=game.Writable&&result!=null;Info.interactable=false;
            }
            else
            {
                var d=ItemBalance.Items[recipe];var q=Workshop.Quote(s,d.Id);RecipeTitle.text=d.Name;Cost.text=(quantity>1?"×"+quantity+" · Kosten je Item: ":"")+Costs(q)+(q.Reason!=null?"\n"+q.Reason:"");Primary.GetComponentInChildren<Text>().text=w.learned[recipe]?"Sofort herstellen":"Bauplan lernen · "+d.BlueprintPrice+" Fragmente";Primary.interactable=game.Writable&&(w.learned[recipe]?q.Allowed:Workshop.LearnBlock(s,recipe)==null);Info.interactable=true;
            }
            if(force||stockChanged)BuildRows();
        }
        public static string Costs(CraftQuote q)=>q.Components==null?"":string.Join(" · ",q.Components.Select((n,i)=>new{n,i}).Where(v=>v.n>0).Select(v=>v.n+" "+ItemBalance.ComponentNames[v.i]).Concat(new[]{q.Data+" Daten"}).Concat((q.Modules??Array.Empty<double>()).Select((n,i)=>new{n,i}).Where(v=>v.n>0).Select(v=>v.n+" "+ItemBalance.Modules[v.i].Name)));
        void BuildRows()
        {
            WorkshopUIFactory.Clear(Rows);WorkshopUIFactory.Clear(Equipment);var s=game.State;var w=s.Workshop;
            if(mode=="components")
            {
                WorkshopUIFactory.Label("Sources",Rows,"Quellen: bezahlte Hardware-Meilensteine und Analysen.",13,40);
                var focus=WorkshopUIFactory.Button("AnalysisFocus",Rows,"Analysefokus: "+(w.focus<0?"Alle Familien":new[]{"Basis","Halbleiter","Photonik","Frontier","Quanten"}[w.focus]),()=>{game.Act(v=>{var next=v.Copy();int f=next.Workshop.focus;do{f++;if(f>4){f=-1;break;}}while(!MaterialAnalysis.Access(next,f));next.Workshop.focus=f;next.Workshop.revision++;return next;});UpdateView(true);});focus.interactable=game.Writable;
                for(int i=0;i<ItemBalance.Modules.Length;i++){int index=i;var d=ItemBalance.Modules[i];var b=WorkshopUIFactory.Button("module-"+d.Id,Rows,d.Name+" ×"+w.modules[i]+(w.hasModuleJob?" · Modulauftrag läuft":" · "+d.Data+" Daten / "+d.Work+" Arbeitssek."),()=>{game.Act(v=>Workshop.ModuleBatch(v,index,quantity));UpdateView(true);});b.interactable=game.Writable&&s.Prestige.moduleQueue.Length+quantity<=100&&Game.Level(s,"blueprints")>0&&s.Data.CompareTo(ScientificNumber.From(d.Data*quantity))>=0&&!d.Costs.Where((cost,c)=>w.components[c]<cost*quantity).Any();}
                for(int i=0;i<ItemBalance.Analyses.Length;i++){int index=i;var d=ItemBalance.Analyses[i];var b=WorkshopUIFactory.Button("analysis-"+d.Id,Rows,d.Id+" · "+d.Cost+" Daten"+(MaterialAnalysis.Block(s,i)!=null?" · "+MaterialAnalysis.Block(s,i):""),()=>{game.Act(v=>MaterialAnalysis.Start(v,index));UpdateView(true);});b.interactable=game.Writable&&MaterialAnalysis.Block(s,i)==null;}
                for(int i=0;i<w.components.Length;i++)WorkshopUIFactory.Label("component-"+i,Rows,ItemBalance.ComponentNames[i]+"  ×"+w.components[i],14,34);
                return;
            }
            if(mode=="blueprints")
            {
                foreach(var d in ItemBalance.Items.OrderBy(d=>d.Starter<0?100:d.Starter))
                {int index=Workshop.Index(d.Id);var row=Instantiate(RowPrefab,Rows);row.name="recipe-"+d.Id;row.Title.text=d.Name;row.Detail.text=w.learned[index]?"Gelernt · auswählen":Workshop.LearnBlock(s,index)??("Lernen: "+d.BlueprintPrice+" Fragmente");var icon=Instantiate(PortraitPrefab,row.Icon.transform);var ir=(RectTransform)icon.transform;ir.anchorMin=ir.anchorMax=new Vector2(.5f,.5f);ir.sizeDelta=new Vector2(58,58);ir.anchoredPosition=Vector2.zero;icon.Bind(new ItemInstance{type=d.Id});icon.Caption.text="";icon.Button.interactable=false;icon.Button.targetGraphic.raycastTarget=false;row.Icon.color=Color.clear;row.Button.onClick.AddListener(()=>SelectRecipe(index));}
                return;
            }
            if(mode=="inventory")
            {
                var active=Workshop.ActiveSlots(s);
                for(int i=0;i<8;i++){int slot=i;var portrait=Instantiate(PortraitPrefab,Equipment);portrait.name="equipment-"+ItemBalance.Slots[i];var item=Item(w.equipped[i]);portrait.Bind(item,ItemBalance.Slots[i].Replace("Aux",""),active[i]?"Leer":"Gesperrt");portrait.Button.onClick.AddListener(()=>{if(item!=null)OpenItem(item.id);else OpenSlot(slot);});}
            }
            var container=WorkshopUIFactory.Node("InventoryGrid",Rows,typeof(GridLayoutGroup),typeof(ContentSizeFitter),typeof(ItemGrid));container.GetComponent<ContentSizeFitter>().verticalFit=ContentSizeFitter.FitMode.PreferredSize;var layout=container.GetComponent<GridLayoutGroup>();layout.constraint=GridLayoutGroup.Constraint.FixedColumnCount;layout.constraintCount=3;layout.spacing=new Vector2(6,8);layout.cellSize=new Vector2(112,130);
            if(w.inventory.Length==0)WorkshopUIFactory.Label("InventoryHint",Rows,"Noch keine Items. Wähle einen gelernten Starterbauplan.",14,50);
            foreach(var item in w.inventory)
            {
                var i=item;var tile=WorkshopUIFactory.Node("item-"+i.id,container.transform);var portrait=Instantiate(PortraitPrefab,tile.transform);var r=(RectTransform)portrait.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,1);r.pivot=new Vector2(.5f,1);r.anchoredPosition=Vector2.zero;r.sizeDelta=new Vector2(94,94);portrait.Bind(i);if(selection.Contains(i.id))portrait.Caption.text+=" ✓";
                portrait.Button.onClick.AddListener(()=>{if(mode=="fusion")ToggleSelection(i.id);else OpenItem(i.id);});var label=WorkshopUIFactory.Label("Name",tile.transform,Workshop.Definition(i).Name,11);var rt=label.rectTransform;rt.anchorMin=new Vector2(0,0);rt.anchorMax=new Vector2(1,0);rt.pivot=new Vector2(.5f,0);rt.sizeDelta=new Vector2(0,32);label.alignment=TextAnchor.UpperCenter;
            }
        }
        void OpenSlot(int n){OpenDetail(null,ItemBalance.Slots[n]+"\n"+(n<3?"Grundslot":n<6?"Freischaltung über "+new[]{"W01","W02","W06"}[n-3]+" oder einen permanenten Slot. Im INT-Netz kaufen; bleibt bei normalem Prestige erhalten.":"Modulares Modell K10"+(n==7?" ab Level 15":"")+". Modellentwicklung ist noch nicht migriert."));}
        public void OpenItem(string id)
        {
            var item=Item(id);if(item==null)return;var d=Workshop.Definition(item);var effects=d.Profiles[item.rarity].Distinct().Select(effect=>effect+": +"+(Workshop.Effect(game.State,item,effect)*100).ToString("F1")+" %");OpenDetail(item,d.Name+" · "+ItemBalance.Rarities[item.rarity]+"\nLevel "+item.level+" · Schmiede "+item.forge+"\n"+string.Join("\n",effects)+(d.Role!=""?"\nBedingter Gerätebonus: "+d.Role+" (Cap "+d.Cap+")":""));
            foreach(var slot in ItemBalance.Slots.Where(slot=>Workshop.EquipmentSlot(game.State,id,slot)!=null)){string target=slot;WorkshopUIFactory.Button("equip-"+slot,DetailActions,"Anlegen: "+slot,()=>{game.Act(s=>Workshop.Equip(s,id,target));CloseDetail();UpdateView(true);});}
            if(game.State.Workshop.equipped.Contains(id)){string slot=ItemBalance.Slots[Array.IndexOf(game.State.Workshop.equipped,id)];WorkshopUIFactory.Button("Unequip",DetailActions,"Ablegen",()=>{game.Act(s=>Workshop.Unequip(s,slot));CloseDetail();UpdateView(true);});}
            WorkshopUIFactory.Button("Lock",DetailActions,item.locked?"Entsperren":"Sperren",()=>{game.Act(s=>Workshop.Lock(s,id));OpenItem(id);UpdateView(true);});var q=Workshop.UpgradeQuote(game.State,item);var upgrade=WorkshopUIFactory.Button("Upgrade",DetailActions,"Level erhöhen · "+Costs(q),()=>{game.Act(s=>Workshop.Upgrade(s,id,q.Revision));OpenItem(id);UpdateView(true);});upgrade.interactable=game.Writable&&q.Allowed;
            var salvage=WorkshopUIFactory.Button("SalvageItem",DetailActions,"Zerlegen · nur gebundene Materialien zurückgewinnen",()=>{float roll=UnityEngine.Random.value;game.Act(v=>MetaAutomation.Salvage(v,id,Math.Min(.999999999,roll)));CloseDetail();UpdateView(true);});salvage.interactable=game.Writable&&!item.locked&&!item.challengeCopy&&!game.State.Workshop.equipped.Contains(id);
            WorkshopUIFactory.Button("SelectForFusion",DetailActions,"Für Fusion auswählen",()=>{CloseDetail();ToggleSelection(id);});
        }
        void OpenRecipe(int index)
        {
            var d=ItemBalance.Items[index];var item=new ItemInstance{type=d.Id,level=1};OpenDetail(item,d.Name+"\n"+Costs(Workshop.Quote(game.State,d.Id))+"\nBauplanpreis: "+d.BlueprintPrice+" Fragmente. Wiederholte Herstellung kostet keine neuen Fragmente.");int level=game.State.Workshop.mastery[index];var b=WorkshopUIFactory.Button("Mastery",DetailActions,"Meisterschaft "+level+" → "+Math.Min(4,level+1),()=>{game.Act(s=>Workshop.Mastery(s,d.Id,level));OpenRecipe(index);UpdateView(true);});b.interactable=level<4&&game.State.Workshop.crafted[index]>0&&game.State.Workshop.fragments>=ItemBalance.MasteryCosts[Math.Min(3,level)]&&game.State.Workshop.learned[index];
        }
        void OpenDetail(ItemInstance item,string text){DetailRoot.SetActive(true);WorkshopUIFactory.Clear(DetailActions);DetailPortrait.Bind(item);DetailText.text=text;var scroll=DetailRoot.GetComponentInChildren<ScrollRect>(true);Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=1;}
        public void CloseDetail(){DetailRoot.SetActive(false);}
    }
}
