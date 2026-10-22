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
  GameRuntime game;Transform content;Text header,notice;Button video;string page="offers",signature="",transaction="";CancellationTokenSource cancellation;readonly IRewardedVideoProvider provider=new UnavailableRewardedVideoProvider();readonly List<Action> refresh=new List<Action>();
  public void Initialize(GameRuntime runtime){game=runtime;ItemPortrait.Sprites=game.WorkshopPrefab.ItemSprites;header=WorkshopUIFactory.Label("MarketHeader",transform,"",16,72);var nav=WorkshopUIFactory.Horizontal("MarketNavigation",transform).transform;WorkshopUIFactory.Button("MarketOffers",nav,"Angebote",()=>ShowPage("offers"));WorkshopUIFactory.Button("MarketMaterials",nav,"Materialien",()=>ShowPage("materials"));notice=WorkshopUIFactory.Label("MarketNotice",transform,"Truhen enthalten Komponenten und manchmal ein Item.",14,48);video=WorkshopUIFactory.Button("MarketVideo",transform,"Video-Truhe · Werbequelle nicht verfügbar",RequestVideo);WorkshopUIFactory.Button("MarketOdds",nav,"Chancen",()=>ShowPage("odds"));content=WorkshopUIFactory.Vertical("MarketContent",transform).transform;Build();}
  void ShowPage(string value){page=value;Build();Canvas.ForceUpdateCanvases();game.Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=1;}
  string Signature()=>game.State.Rewards.shopRevision+":"+game.State.Market.hasPending+":"+Market.Rotation(game.State).day+":"+page;
  void Update(){if(game==null)return;if(signature!=Signature())Build();var s=game.State;var q=Market.Quote(s,"free-common");var ad=Market.VideoQuote(s);header.text=s.Retention.gems+" GEMS · MARKT\nFreie Truhe: "+(q.FreeRemaining<=0?"bereit":Seconds(q.FreeRemaining))+"\nRotation in "+Seconds(q.RotationRemaining);video.interactable=game.Writable&&ad.Allowed&&transaction=="";video.GetComponentInChildren<Text>().text="Video-Truhe · "+ad.Remaining+" / "+MarketBalance.VideoLimit+(PurchaseRules.AdFree(s)?" · ohne Video":" · derzeit nicht verfügbar");foreach(var update in refresh)update();}
  static string Seconds(double milliseconds)=>Math.Ceiling(Math.Max(0,milliseconds)/1000)+" s";
  static string Reason(string code)=>code==null?"Kaufen":code=="challenge"?"Hauptspiel pausiert":code=="limit"?"Beleggrenze":code=="expired"?"Angebot abgelaufen":code=="locked"?"Materialzugang fehlt":code=="sold"?"Heute ausverkauft":code=="cooldown"?"Freie Truhe noch nicht bereit":code=="gems"?"Gems fehlen":code;
  ActionCard Card(string name,string title,Action action){var c=Instantiate(game.CardPrefab,content);c.gameObject.name=name;c.Title.text=title;c.Title.fontSize=16;c.Detail.fontSize=14;c.Icon.gameObject.SetActive(false);c.GetComponent<LayoutElement>().preferredHeight=180;c.Button.onClick.AddListener(()=>{game.GetComponent<RewardPresentation>()?.SetOrigin(c.Icon.gameObject.activeSelf?c.Icon.transform:c.transform);action();});return c;}
  void Build()
  {
   signature=Signature();WorkshopUIFactory.Clear(content);refresh.Clear();var s=game.State;
   if(page=="odds"){foreach(var d in SeasonBalance.Chests){var card=Card("MarketOdds-"+d.Id,d.Id+"-Truhe",()=>{});card.Button.interactable=false;card.GetComponent<LayoutElement>().preferredHeight=240;card.Detail.text=ChestDescription(d.Id)+"\nSeltenheiten bei Itemfund:\n"+string.Join(" · ",d.Weights.Select((w,i)=>new{w,i}).Where(x=>x.w>0).Select(x=>ItemBalance.Rarities[x.i]+" "+(x.w/d.Weights.Sum()*100)+" %"));}foreach(string type in SeasonRules.Pool(s)){var text=WorkshopUIFactory.Label("MarketPool-"+type,content,ItemBalance.Items[Workshop.Index(type)].Name,14,48);text.alignment=TextAnchor.MiddleLeft;}return;}
   if(s.Market.hasPending){string tx=s.Market.pending.id;WorkshopUIFactory.Button("MarketCancelVideo",content,"Offenen Videoauftrag abbrechen",()=>game.Act(v=>Market.CancelVideo(v,tx)));}
   foreach(var offer in Market.Offers(s).Where(o=>page=="materials"?o.Kind=="material"&&!o.Stock:o.Kind!="material"||o.Stock))
   {
    string id=offer.Id;var ticket=Market.Quote(s,id).Ticket;string title=offer.Kind=="chest"?(id=="free-common"?"Freie ":"")+offer.Tier+"-Truhe":offer.Kind=="item"?"Tagesitem · "+ItemBalance.Items[Workshop.Index(offer.Item)].Name:(offer.Stock?"Tagesangebot · ":"")+ItemBalance.ComponentNames[offer.Component];var card=Card("MarketOffer-"+id,title,()=>{bool paid=game.Act(v=>Market.Buy(v,ticket),"shop-buy");notice.text=paid?"Kauf gespeichert.":Market.Quote(game.State,id).Reason=="sold"||Market.Quote(game.State,id).Reason=="cooldown"?"Bereits abgeholt. Kein zweiter Kauf.":"Kein weiterer Kauf: Ticket, Bestandsgrenze oder Angebot prüfen.";});
    if(offer.Kind=="item"){card.Icon.gameObject.SetActive(true);card.Icon.color=Color.clear;var portrait=Instantiate(game.WorkshopPrefab.PortraitPrefab,card.Icon.transform);var r=(RectTransform)portrait.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=new Vector2(58,58);r.anchoredPosition=Vector2.zero;portrait.Bind(new ItemInstance{type=offer.Item,rarity=offer.Rarity});portrait.Caption.text="";portrait.Button.interactable=false;portrait.Button.targetGraphic.raycastTarget=false;}
    else if(offer.Kind=="material"){card.Icon.gameObject.SetActive(true);card.Icon.sprite=game.WorkshopPrefab.ComponentSprites[offer.Component];card.Icon.preserveAspect=true;}
    string contents=offer.Kind=="material"?offer.Amount+" Komponenten":offer.Kind=="item"?ItemBalance.Rarities[offer.Rarity]:ChestDescription(offer.Tier);refresh.Add(()=>{var quote=Market.Quote(game.State,id);card.Detail.text=contents+"\n"+(offer.Payment=="free"?"Kostenlos":offer.Cost+" Gems")+(offer.OriginalCost>0?" · vorher "+offer.OriginalCost:"")+"\n"+Reason(quote.Reason);card.Button.interactable=game.Writable&&quote.Allowed;});
   }
   if(s.Rewards.hasReceipt){var r=s.Rewards.receipt;var card=Card("MarketReceipt","Ergebnis #"+r.id,()=>{});card.Button.interactable=false;card.Detail.text=r.components.Sum()+" Komponenten"+(r.hasItem?" · "+ItemBalance.Items[Workshop.Index(r.item.type)].Name+" ("+ItemBalance.Rarities[r.item.rarity]+")":"")+(r.voucherGranted?" · +1 Gumball-Gutschein":"")+"\n"+r.cost+" Gems · "+r.payment;}
  }
  static string ChestDescription(string tier){var d=SeasonBalance.Chests.First(c=>c.Id==tier);return d.Rolls+" Funde · je "+d.Minimum+"–"+d.Maximum+"\nItemchance "+(d.ItemChance/100d)+" % · Gumball-Gutschein "+(VoucherRules.ChestChance(tier)*100d).ToString("0.##",System.Globalization.CultureInfo.InvariantCulture)+" %";}
  async void RequestVideo()
  {
   if(transaction!=""||!Market.VideoQuote(game.State).Allowed)return;if(!game.AcquireRewardRequest())return;string tx="market-video-"+Guid.NewGuid().ToString("N");if(!game.Act(s=>Market.BeginVideo(s,tx)))return;if(PurchaseRules.AdFree(game.State)){game.Act(s=>Market.ClaimAdFree(s,tx),"shop-video");notice.text="Werbefrei-Anspruch gespeichert. Keine Anzeige abgespielt.";return;}transaction=tx;cancellation=new CancellationTokenSource();RewardProviderResult result;
   try{result=await provider.ShowAsync("shopChest",tx,cancellation.Token);}catch(OperationCanceledException){result=RewardProviderResult.Cancelled;}catch{result=RewardProviderResult.Failed;}
   if(game!=null)game.Act(s=>Market.CompleteVideo(s,tx,result.ToString().ToLowerInvariant()),"shop-video");if(this!=null){transaction="";notice.text=result==RewardProviderResult.Unavailable?"Keine Werbequelle verfügbar. Keine Truhe oder Limits verbucht.":result==RewardProviderResult.Cancelled?"Videoauftrag abgebrochen. Keine Belohnung.":result==RewardProviderResult.Failed?"Video fehlgeschlagen. Keine Belohnung.":"Providerergebnis verarbeitet.";cancellation?.Dispose();cancellation=null;}
  }
  void OnDisable(){cancellation?.Cancel();if(game!=null&&transaction!="")game.Act(s=>Market.CancelVideo(s,transaction));}
 }
}
