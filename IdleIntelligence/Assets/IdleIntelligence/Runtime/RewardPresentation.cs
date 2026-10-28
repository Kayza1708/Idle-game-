using System;using System.Linq;using System.Collections.Generic;using UnityEngine;using UnityEngine.UI;using IdleIntelligence.Core;
namespace IdleIntelligence.Runtime {
 // Called only after GameRuntime's atomic write succeeds; domain has no reference to this consumer.
 public sealed class RewardPresentation:MonoBehaviour {
  Vector3? origin;public void SetOrigin(Transform source){origin=source.position;}public void ClearOrigin(){origin=null;}
  GameRuntime game;RewardStage stage;public RewardStage Current=>stage;
  public void Initialize(GameRuntime runtime){game=runtime;}
  public void Cancel(){if(stage!=null)stage.Cancel();}
  void OnDestroy(){if(stage!=null)Destroy(stage.gameObject);}
  void OnApplicationPause(bool paused){if(paused)Cancel();}void OnApplicationFocus(bool focused){if(!focused)Cancel();}
  RectTransform Inventory=>(RectTransform)game.ItemsTab.transform;
  List<RewardVisual> Materials(long[] amounts){var list=new List<RewardVisual>();for(int i=0;i<amounts.Length;i++)if(amounts[i]>0)list.Add(new RewardVisual{Sprite=game.WorkshopPrefab.ComponentSprites[i],Label="+"+amounts[i],Name=UiLocalizedText.Translate(ItemBalance.ComponentNames[i],game.State.Settings.language),Target=Inventory});return list;}
  void Voucher(List<RewardVisual> list,bool granted){if(granted)list.Add(new RewardVisual{Sprite=VoucherSprite.Get(),Label="Gumball +1",Target=(RectTransform)game.ResearchTab.transform});}
  void Item(List<RewardVisual> list,ItemInstance item){if(item!=null)list.Insert(0,new RewardVisual{Item=item.Copy(),Label=SettingsRules.Text(game.State.Settings.language,"item:"+item.type)+" · "+SettingsRules.Text(game.State.Settings.language,"rarity:"+ItemBalance.Rarities[item.rarity])+" · Lv. "+item.level,Tint=ItemPortrait.RarityColor(item.rarity),Target=Inventory});}
  void Show(string key,string kind,string tier,List<RewardVisual> values){if(values.Count==0)return;if(stage==null){stage=Instantiate(Resources.Load<RewardStage>("PixelUI/RewardStage"),game.Content.GetComponentInParent<Canvas>().transform);stage.Initialize(game);stage.gameObject.AddComponent<SafeArea>();}stage.transform.SetAsLastSibling();stage.Origin=origin;origin=null;stage.Present(key,kind,Math.Max(0,Array.IndexOf(new[]{"common","rare","epic","legendary"},tier)),values);}
  public void Receipt(GameState before,GameState after,string action){
   if(after.Lifetime.dropsClaimed>before.Lifetime.dropsClaimed){
    var list=Materials(after.Workshop.components.Select((v,i)=>Math.Max(0,v-before.Workshop.components[i])).ToArray());
    var shell=game.GetComponent<MobileShell>();
    var credits=after.Credits.Subtract(before.Credits);var data=after.Data.Subtract(before.Data);
    if(credits.CompareTo(ScientificNumber.Zero)>0)list.Add(new RewardVisual{Sprite=shell.ResourceIcons[0],Label="+"+NumberFormatting.Format(credits,after.Settings.numberFormat,after.Settings.language),Name="Credits",Tint=GameTheme.Gold,Target=(RectTransform)game.Credits.transform});
    if(data.CompareTo(ScientificNumber.Zero)>0)list.Add(new RewardVisual{Sprite=shell.ResourceIcons[1],Label="+"+NumberFormatting.Format(data,after.Settings.numberFormat,after.Settings.language),Name=SettingsRules.Text(after.Settings.language,"game:data"),Target=(RectTransform)game.Data.transform});
    foreach(var item in after.Workshop.inventory.Where(i=>!before.Workshop.inventory.Any(old=>old.id==i.id)))Item(list,item);
    for(int i=0;i<after.Workshop.knownBlueprints.Length;i++)if(after.Workshop.knownBlueprints[i]&&!before.Workshop.knownBlueprints[i])list.Add(new RewardVisual{Sprite=Resources.Load<PresentationArt>("PixelUI/PresentationArt").Blueprint,Label=SettingsRules.Text(after.Settings.language,"item:"+ItemBalance.Items[i].Id),Name=UiLocalizedText.Translate("Bauplan",after.Settings.language),Target=Inventory});
    if(after.Workshop.fragments>before.Workshop.fragments)list.Add(new RewardVisual{Sprite=Resources.Load<PresentationArt>("PixelUI/PresentationArt").Blueprint,Label="+"+(after.Workshop.fragments-before.Workshop.fragments),Name=UiLocalizedText.Translate("Bauplanfragment",after.Settings.language),Target=Inventory});
    Show("signal:"+after.Lifetime.dropsClaimed,"drone","common",list);return;
   }
   if(after.Rewards.hasReceipt&&(!before.Rewards.hasReceipt||before.Rewards.receipt.id!=after.Rewards.receipt.id)){var r=after.Rewards.receipt;var list=Materials(r.components);Item(list,r.hasItem?r.item:null);Voucher(list,r.voucherGranted);Show("shop:"+r.id,r.kind=="chest"||r.payment=="season"?"chest":"purchase",r.tier,list);return;}
   if(after.Missions.boxes.hasLast&&(!before.Missions.boxes.hasLast||before.Missions.boxes.last.id!=after.Missions.boxes.last.id)){var r=after.Missions.boxes.last;var list=Materials(r.components);Voucher(list,r.voucherGranted);if(r.blueprint!="")list.Add(new RewardVisual{Sprite=Resources.Load<PresentationArt>("PixelUI/PresentationArt").Blueprint,Label=r.blueprint=="fragment"?UiLocalizedText.Translate("Bauplanfragment",after.Settings.language)+" +1":SettingsRules.Text(after.Settings.language,"item:"+r.blueprint),Target=Inventory});Show("bonus:"+r.id,"chest","common",list);return;}
   if(after.Capsules.hasLast&&(!before.Capsules.hasLast||before.Capsules.last.id!=after.Capsules.last.id)){var r=after.Capsules.last;var list=Materials(r.components);Item(list,r.kind=="item"?after.Workshop.inventory.FirstOrDefault(i=>i.id==r.itemId):null);if(r.hasResource){bool gems=r.resourceId=="gems",data=r.resourceId=="data";list.Add(new RewardVisual{Sprite=gems?Resources.Load<Sprite>("PixelUI/gem"):game.GetComponent<MobileShell>().ResourceIcons[data?1:0],Label="+"+NumberFormatting.Format(ScientificNumber.FromData(r.amount),after.Settings.numberFormat,after.Settings.language)+" "+(gems?"Gems":data?SettingsRules.Text(after.Settings.language,"game:data"):"Credits"),Tint=r.kind=="jackpot"?GameTheme.Gold:GameTheme.Accent,Target=(RectTransform)(gems?game.Users:data?game.Data:game.Credits).transform});}Show("capsule:"+r.id,"capsule","common",list);return;}
   if(action=="gem-offer"&&after.Upgrades.processed.Length>before.Upgrades.processed.Length){var delta=after.Workshop.components.Select((v,i)=>Math.Max(0,v-before.Workshop.components[i])).ToArray();var list=Materials(delta);if(list.Count==0){string id=after.Upgrades.processed.Last().Split(':')[0];var offer=GemBalance.Offers.FirstOrDefault(o=>o.Id==id);list.Add(new RewardVisual{Sprite=Resources.Load<Sprite>("PixelUI/gem"),Label=UiLocalizedText.Translate(offer?.Name??"Kauf abgeschlossen",after.Settings.language),Target=(RectTransform)game.Users.transform});}Show("upgrade:"+after.Upgrades.processed.Last(),"purchase","common",list);}
  }
 }
}
