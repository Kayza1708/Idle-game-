using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class MarketView:MonoBehaviour
 {
  GameRuntime game;Transform content;Text header,notice;Button video;string page="offers",signature="",transaction="";GameObject purchaseDialog,infoDialog;CancellationTokenSource cancellation;readonly IRewardedVideoProvider provider=new UnavailableRewardedVideoProvider();readonly List<Action> refresh=new List<Action>();
  public void Initialize(GameRuntime runtime,bool embedded=false){game=runtime;StorefrontUI.FitWidth(transform);ItemPortrait.Sprites=game.WorkshopPrefab.ItemSprites;header=WorkshopUIFactory.Label("MarketHeader",transform,"",16,72);header.gameObject.SetActive(!embedded);var nav=WorkshopUIFactory.Horizontal("MarketNavigation",transform).transform;nav.gameObject.SetActive(!embedded);WorkshopUIFactory.Button("MarketOffers",nav,"Angebote",()=>ShowPage("offers"));WorkshopUIFactory.Button("MarketMaterials",nav,"Materialien",()=>ShowPage("materials"));notice=WorkshopUIFactory.Label("MarketNotice",transform,"",13,0);AdaptiveTextHeight.Attach(notice);video=WorkshopUIFactory.Button("MarketVideo",transform,"Video-Truhe · Werbequelle nicht verfügbar",RequestVideo);WorkshopUIFactory.Button("MarketOdds",nav,"Chancen",()=>ShowPage("odds"));content=WorkshopUIFactory.Vertical("MarketContent",transform).transform;StorefrontUI.FitWidth(content);Build();}
  public void OpenPage(string value){if(page==value)return;page=value;Build();}void ShowPage(string value){OpenPage(value);Canvas.ForceUpdateCanvases();game.Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=1;}
  string Signature()=>game.State.Rewards.shopRevision+":"+game.State.Market.hasPending+":"+Market.Rotation(game.State).day+":"+page;
  void Update(){if(game==null)return;if(signature!=Signature())Build();var s=game.State;var q=Market.Quote(s,"free-common");var ad=Market.VideoQuote(s);header.text=s.Retention.gems+" GEMS · MARKT\nFreie Truhe: "+(q.FreeRemaining<=0?"bereit":Seconds(q.FreeRemaining))+"\nRotation in "+Seconds(q.RotationRemaining);video.gameObject.SetActive(PurchaseRules.AdFree(s));video.interactable=game.Writable&&ad.Allowed&&transaction=="";video.GetComponentInChildren<Text>().text="Video-Truhe · "+ad.Remaining+" / "+MarketBalance.VideoLimit+(PurchaseRules.AdFree(s)?" · ohne Video":" · derzeit nicht verfügbar");notice.gameObject.SetActive(!string.IsNullOrEmpty(notice.text));foreach(var update in refresh)update();}
  static string Seconds(double milliseconds)=>Math.Ceiling(Math.Max(0,milliseconds)/1000)+" s";
  static string Reason(string code)=>code==null?"Kaufen":code=="challenge"?"Hauptspiel pausiert":code=="limit"?"Beleggrenze":code=="expired"?"Angebot abgelaufen":code=="locked"?"Materialzugang fehlt":code=="sold"?"Heute ausverkauft":code=="cooldown"?"Freie Truhe noch nicht bereit":code=="gems"?"Gems fehlen":code;
  ActionCard Card(string name,string title,Action action){var c=Instantiate(game.CardPrefab,content);c.gameObject.name=name;c.Title.text=title;c.Title.fontSize=16;c.Detail.fontSize=14;c.Icon.gameObject.SetActive(false);c.gameObject.AddComponent<CompactActionCard>();c.Button.onClick.AddListener(()=>{game.GetComponent<RewardPresentation>()?.SetOrigin(c.Icon.gameObject.activeSelf?c.Icon.transform:c.transform);action();});return c;}
  void Build()
  {
   signature=Signature();WorkshopUIFactory.Clear(content);refresh.Clear();var s=game.State;
   if(page=="odds"){foreach(var d in SeasonBalance.Chests){var card=Card("MarketOdds-"+d.Id,d.Id+"-Truhe",()=>{});card.Button.interactable=false;card.GetComponent<LayoutElement>().preferredHeight=240;card.Detail.text=ChestDescription(d.Id,s)+"\nSeltenheiten bei Itemfund:\n"+string.Join(" · ",d.Weights.Select((w,i)=>new{w,i}).Where(x=>x.w>0).Select(x=>ItemBalance.Rarities[x.i]+" "+(x.w/d.Weights.Sum()*100)+" %"));}foreach(string type in SeasonRules.Pool(s)){var text=WorkshopUIFactory.Label("MarketPool-"+type,content,ItemBalance.Items[Workshop.Index(type)].Name,14,48);text.alignment=TextAnchor.MiddleLeft;}return;}
   if(s.Market.hasPending){string tx=s.Market.pending.id;WorkshopUIFactory.Button("MarketCancelVideo",content,"Offenen Videoauftrag abbrechen",()=>game.Act(v=>Market.CancelVideo(v,tx)));}
   bool dailyHeading=false,chestHeading=false;Transform dailyStrip=null,chestGrid=null;
   var offers=Market.Offers(s).Where(o=>page=="materials"?o.Kind=="material"&&!o.Stock:o.Kind!="material"||o.Stock).OrderBy(o=>o.Kind=="chest"&&o.Id!="free-common"?1:0).ToArray();
   if(page=="materials")chestGrid=PresentationLayout.Grid("MaterialsGallery",content,2,offers.Length,200);
   foreach(var offer in offers)
   {
    if(page!="materials"){bool daily=offer.Kind!="chest"||offer.Id=="free-common";if(daily&&!dailyHeading||!daily&&!chestHeading){WorkshopUIFactory.Label(daily?"DailyHeading":"ChestHeading",content,daily?UiLocalizedText.Translate("Tagesangebote",s.Settings.language):UiLocalizedText.Translate("Kisten",s.Settings.language),16,32);if(daily){dailyHeading=true;dailyStrip=PresentationLayout.Grid("DailyDeals",content,2,offers.Count(o=>o.Kind!="chest"||o.Id=="free-common"),200);StorefrontUI.FitWidth(dailyStrip);}else {chestHeading=true;chestGrid=PresentationLayout.Grid("ChestGallery",content,2,offers.Count(o=>o.Kind=="chest"&&o.Id!="free-common"),200);}}}
    string id=offer.Id;var ticket=Market.Quote(s,id).Ticket;string title=offer.Kind=="chest"?(id=="free-common"?"Freie ":"")+offer.Tier+"-Truhe":offer.Kind=="item"?ItemBalance.Items[Workshop.Index(offer.Item)].Name:ItemBalance.ComponentNames[offer.Component]+" × "+offer.Amount;var card=Card("MarketOffer-"+id,title,()=>{if(offer.Payment=="free")CommitPurchase(id,ticket);else ConfirmPurchase(id,ticket,title);});
    if((offer.Kind!="chest"||id=="free-common")&&dailyStrip!=null){card.transform.SetParent(dailyStrip,false);StorefrontUI.FitWidth(card.transform);}
    else if(chestGrid!=null){StorefrontUI.FitWidth(chestGrid);card.transform.SetParent(chestGrid,false);StorefrontUI.FitWidth(card.transform);}
    if(offer.Kind=="chest"){card.Icon.gameObject.SetActive(true);card.Icon.sprite=StorefrontUI.Chest(Array.FindIndex(SeasonBalance.Chests,c=>c.Id==offer.Tier));card.Icon.preserveAspect=true;card.Icon.color=Color.white;}

    if(offer.Kind=="item"){card.Icon.gameObject.SetActive(true);card.Icon.color=Color.clear;var portrait=Instantiate(game.WorkshopPrefab.PortraitPrefab,card.Icon.transform);var r=(RectTransform)portrait.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=new Vector2(58,58);r.anchoredPosition=Vector2.zero;portrait.Bind(new ItemInstance{type=offer.Item,rarity=offer.Rarity});portrait.Caption.text="";portrait.Button.interactable=false;portrait.Button.targetGraphic.raycastTarget=false;}
    else if(offer.Kind=="material"){card.Icon.gameObject.SetActive(true);card.Icon.sprite=game.WorkshopPrefab.ComponentSprites[offer.Component];card.Icon.preserveAspect=true;}
    string contents=offer.Kind=="material"?"× "+offer.Amount:offer.Kind=="item"?SettingsRules.Text(s.Settings.language,"rarity:"+ItemBalance.Rarities[offer.Rarity]):SeasonBalance.Chests.First(c=>c.Id==offer.Tier).Rolls+" × "+UiLocalizedText.Translate("Funde",s.Settings.language);
    var price=StorefrontUI.Product(card,true);if(offer.Kind=="chest"){var info=WorkshopUIFactory.Button("ChestInformation",card.transform,"i",()=>OpenInfo(title,ChestDescription(offer.Tier,game.State)+"\n"+string.Join(" · ",SeasonRules.Pool(game.State).Select(t=>SettingsRules.Text(game.State.Settings.language,"item:"+t)))));var ignore=info.GetComponent<LayoutElement>();ignore.ignoreLayout=true;var rect=(RectTransform)info.transform;rect.anchorMin=rect.anchorMax=Vector2.one;rect.pivot=Vector2.one;rect.sizeDelta=new Vector2(44,44);rect.anchoredPosition=Vector2.zero;info.GetComponent<Image>().sprite=null;info.GetComponent<Image>().color=Color.clear;}

    refresh.Add(()=>{var quote=Market.Quote(game.State,id);card.Detail.text=contents+(quote.Reason==null?"":"\n"+UiLocalizedText.Translate(Reason(quote.Reason),s.Settings.language));StorefrontUI.Price(price,StorefrontUI.Gem(game),offer.Payment=="free"?UiLocalizedText.Translate("Kostenlos",s.Settings.language):offer.Cost.ToString(),quote.Allowed?GameTheme.Enough:GameTheme.Missing,offer.Payment=="free");card.Button.interactable=game.Writable&&quote.Allowed;});
   }
   if(s.Rewards.hasReceipt){var r=s.Rewards.receipt;var card=Card("MarketReceipt","Ergebnis #"+r.id,()=>{});card.Button.interactable=false;card.Detail.text=r.components.Sum()+" Komponenten"+(r.hasItem?" · "+ItemBalance.Items[Workshop.Index(r.item.type)].Name+" ("+ItemBalance.Rarities[r.item.rarity]+")":"")+(r.voucherGranted?(ProgressionVisibility.Gumball(s)?" · +1 Gumball-Gutschein":" · +1 Gutschein"):"")+"\n"+r.cost+" Gems · "+r.payment;}
  }
  static string ChestDescription(string tier,GameState state){var d=SeasonBalance.Chests.First(c=>c.Id==tier);int pool=SeasonRules.Pool(state).Length;string rarity=string.Join(" · ",d.Weights.Select((w,i)=>new{w,i}).Where(x=>x.w>0).Select(x=>SettingsRules.Text(state.Settings.language,"rarity:"+ItemBalance.Rarities[x.i])+" "+(x.w/d.Weights.Sum()*100).ToString("0.##")+" %"));return d.Rolls+" Funde · je "+d.Minimum+"–"+d.Maximum+"\nItemchance "+(d.ItemChance/100d)+" %"+(ProgressionVisibility.Gumball(state)?" · Gumball-Gutschein ":" · Gutschein ")+(VoucherRules.ChestChance(tier)*100d).ToString("0.##",System.Globalization.CultureInfo.InvariantCulture)+" %"+"\n"+rarity+"\n"+(state.Settings.language=="de"?"Je zugänglichem Itemtyp: ":"Each accessible item type: ")+(pool==0?"0":(d.ItemChance/100d/pool).ToString("0.####"))+" %";}
  void OpenInfo(string title,string text){if(infoDialog!=null)Destroy(infoDialog);infoDialog=StorefrontUI.Info(game,"MarketInformation",title,text);}
  void CommitPurchase(string id,MarketTicket ticket)
  {
   bool paid=game.Act(v=>Market.Buy(v,ticket),"shop-buy");
   var current=Market.Quote(game.State,id);
   notice.text=paid?"Kauf gespeichert.":current.Reason=="sold"||
     current.Reason=="cooldown"?"Bereits abgeholt. Kein zweiter Kauf.":
     "Kauf nicht möglich: Preis, Gems oder Angebot prüfen.";
  }
  void ClosePurchase()
  {
   if(purchaseDialog==null)return;
   purchaseDialog.SetActive(false);
   Destroy(purchaseDialog);
   purchaseDialog=null;
  }
  void ConfirmPurchase(string id,MarketTicket ticket,string title)
  {
   ClosePurchase();
   var quote=Market.Quote(game.State,id);
   if(!quote.Allowed||quote.Offer==null){notice.text=Reason(quote.Reason);return;}
   var offer=quote.Offer;
   var canvas=game.Content.GetComponentInParent<Canvas>();
   purchaseDialog=Instantiate(game.WorkshopPrefab.DetailRoot,canvas.transform);
   purchaseDialog.name="ShopPurchaseConfirm";
   purchaseDialog.SetActive(true);
   WorkshopUIFactory.Fill((RectTransform)purchaseDialog.transform);
   purchaseDialog.AddComponent<SafeArea>();
   var close=purchaseDialog.transform.Find("DetailPanel/CloseItemDetail").
       GetComponent<Button>();
   close.onClick.RemoveAllListeners();
   close.onClick.AddListener(ClosePurchase);
   close.GetComponentInChildren<Text>().text="×";
   var scroll=purchaseDialog.GetComponentInChildren<ScrollRect>(true);
   foreach(Transform child in scroll.content)child.gameObject.SetActive(false);
   var body=WorkshopUIFactory.Vertical("PurchasePreview",scroll.content);
   WorkshopUIFactory.Label("PurchaseTitle",body.transform,title,20,44);
   if(offer.Kind=="chest"){
    var preview=WorkshopUIFactory.Node("PurchaseArtwork",body.transform,typeof(Image));WorkshopUIFactory.Size(preview,68);
    var image=preview.GetComponent<Image>();image.sprite=StorefrontUI.Chest(Array.FindIndex(SeasonBalance.Chests,c=>c.Id==offer.Tier));image.preserveAspect=true;image.raycastTarget=false;
   }
   string details=offer.Kind=="chest"?ChestDescription(offer.Tier,game.State):
     offer.Kind=="material"?offer.Amount+" × "+
       ItemBalance.ComponentNames[offer.Component]:
       ItemBalance.Items[Workshop.Index(offer.Item)].Name;
   var detail=WorkshopUIFactory.Label("PurchaseDetails",body.transform,details.Replace(" %","\u00A0%"),13,44);AdaptiveTextHeight.Attach(detail);
   var price=StorefrontUI.CurrencyLine(body.transform,44,15);price.name="PurchasePrice";
   string F(double value)=>NumberFormatting.Format(ScientificNumber.From(value),game.State.Settings.numberFormat,game.State.Settings.language);
   StorefrontUI.Price(price,StorefrontUI.Gem(game),F(offer.Cost)+" · "+F(game.State.Retention.gems)+(game.State.Settings.language=="de"?" vorhanden":" available"),GameTheme.Text);
   WorkshopUIFactory.Button("PurchaseCancel",body.transform,
       "Abbrechen",ClosePurchase);
   var confirm=WorkshopUIFactory.Button("PurchaseConfirm",body.transform,
       "Kaufen · "+offer.Cost+" Gems",()=>{
         // Market.Buy checks ticket/day/revision/stock/price again atomically.
         ClosePurchase();
         CommitPurchase(id,ticket);
       });
   GameTheme.ButtonStyle(confirm,true);StorefrontUI.CurrencyButton(confirm,StorefrontUI.Gem(game));
   confirm.interactable=game.Writable&&quote.Allowed;
   Canvas.ForceUpdateCanvases();
   scroll.verticalNormalizedPosition=1;
  }
  async void RequestVideo()
  {
   if(transaction!=""||!Market.VideoQuote(game.State).Allowed)return;if(!game.AcquireRewardRequest())return;string tx="market-video-"+Guid.NewGuid().ToString("N");if(!game.Act(s=>Market.BeginVideo(s,tx)))return;if(PurchaseRules.AdFree(game.State)){game.Act(s=>Market.ClaimAdFree(s,tx),"shop-video");notice.text="Werbefrei-Anspruch gespeichert. Keine Anzeige abgespielt.";return;}transaction=tx;cancellation=new CancellationTokenSource();RewardProviderResult result;
   try{result=await provider.ShowAsync("shopChest",tx,cancellation.Token);}catch(OperationCanceledException){result=RewardProviderResult.Cancelled;}catch{result=RewardProviderResult.Failed;}
   if(game!=null)game.Act(s=>Market.CompleteVideo(s,tx,result.ToString().ToLowerInvariant()),"shop-video");if(this!=null){transaction="";notice.text=result==RewardProviderResult.Unavailable?"Keine Werbequelle verfügbar. Keine Truhe oder Limits verbucht.":result==RewardProviderResult.Cancelled?"Videoauftrag abgebrochen. Keine Belohnung.":result==RewardProviderResult.Failed?"Video fehlgeschlagen. Keine Belohnung.":"Providerergebnis verarbeitet.";cancellation?.Dispose();cancellation=null;}
  }
  void OnDisable(){if(infoDialog!=null){Destroy(infoDialog);infoDialog=null;}ClosePurchase();cancellation?.Cancel();if(game!=null&&transaction!="")game.Act(s=>Market.CancelVideo(s,transaction));}
 }
}
