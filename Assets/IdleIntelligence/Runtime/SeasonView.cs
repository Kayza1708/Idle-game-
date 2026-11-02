using System;
using System.Linq;
using System.Collections.Generic;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class SeasonView:MonoBehaviour
 {
  GameRuntime game;Transform content;Text header;string selected="",signature="";int track,band;bool collection;readonly List<Action> refresh=new List<Action>();
  public void Initialize(GameRuntime runtime){game=runtime;ItemPortrait.Sprites=runtime.WorkshopPrefab.ItemSprites;header=WorkshopUIFactory.Label("SeasonHeader",transform,"",16,96);var tracks=WorkshopUIFactory.Horizontal("SeasonTracks",transform).transform;WorkshopUIFactory.Button("SeasonCollectionAccess",tracks,"Sammlung",()=>{collection=!collection;Build();});for(int i=0;i<2;i++){int t=i;WorkshopUIFactory.Button("SeasonTrack-"+i,tracks,i==0?"Free":"Premium",()=>{track=t;Build();});}var pages=WorkshopUIFactory.Horizontal("SeasonPages",transform).transform;for(int i=0;i<5;i++){int p=i;WorkshopUIFactory.Button("SeasonBand-"+i,pages,(i*10+1)+"–"+(i*10+10),()=>{band=p;Build();});}content=WorkshopUIFactory.Vertical("SeasonRewards",transform).transform;Build();}
  string ChestLabel(string tier)=>UiLocalizedText.Translate("Truhe",game.State.Settings.language)+" · "+SettingsRules.Text(game.State.Settings.language,"rarity:"+tier);
  string Signature()=>game.State.Missions.season.id+":"+game.State.Missions.hasPrevious+":"+game.State.Missions.previous?.id+":"+string.Join(",",game.State.Rewards.chests.Select(c=>c.id));
  string Selected()=>selected==""?game.State.Missions.season.id:selected;
  void Update(){if(game==null)return;if(signature!=Signature())Build();var s=game.State;string id=Selected();var p=SeasonRules.Target(s,id);if(p==null){selected="";Build();p=s.Missions.season;id=p.id;}int theme=SeasonRules.Theme(id);header.text=SeasonBalance.ThemeNames[theme]+" · "+id+"\n"+SeasonBalance.ThemeSubtitles[theme]+"\nStufe "+SeasonRules.Level(p)+" / 50 · "+p.xp+" XP\n"+(ChallengeRules.Active(s)?"Hauptspiel pausiert":"Gems: "+s.Retention.gems);foreach(var update in refresh)update();}
  void Text(string name,string value,int height=72){var t=WorkshopUIFactory.Label(name,content,value,14,height);t.alignment=TextAnchor.UpperLeft;}
  ActionCard Card(string name,string title,Action action){var c=Instantiate(game.CardPrefab,content);c.gameObject.name=name;c.Title.text=title;c.Title.fontSize=16;c.Detail.fontSize=14;c.Icon.gameObject.SetActive(false);c.GetComponent<LayoutElement>().preferredHeight=180;c.Button.onClick.AddListener(()=>action());return c;}
  void Build()
  {
   signature=Signature();WorkshopUIFactory.Clear(content);refresh.Clear();var s=game.State;if(collection){Text("SeasonCollectionBonus","ARTEFAKTE · Einnahmenfaktor ×"+SeasonRules.ArtifactFactor(s),72);foreach(string artifact in s.Retention.artifacts){var parts=artifact.Split('-');string origin=parts.Length>1?parts[0]+"-"+parts[1]:s.Missions.season.id;Text("SeasonArtifact-"+artifact,SeasonBalance.ThemeNames[SeasonRules.Theme(origin)]+" · "+(artifact.Contains("-premium-")?"Premium":"Free")+"\n"+artifact,72);}if(s.Retention.artifacts.Length==0)Text("SeasonEmptyCollection","Noch keine Season-Artefakte erhalten.",72);return;}string id=Selected();var p=SeasonRules.Target(s,id);if(p==null){selected="";id=s.Missions.season.id;p=s.Missions.season;}string seasonId=id;int chosenTrack=track;
   if(s.Missions.startPending){Text("SeasonMigrationPending","Die erste Season beginnt nach der Hauptspiel-Synchronisierung.");return;}
   if(s.Missions.hasPrevious&&s.SavedAt<=s.Missions.previous.claimUntil){WorkshopUIFactory.Button("SeasonCurrent",content,"Aktuelle Season",()=>{selected="";Build();});WorkshopUIFactory.Button("SeasonPrevious",content,"Vorherige Season · Kulanz",()=>{selected=game.State.Missions.previous.id;Build();});}
   Text("SeasonDeadlines","Ende UTC: "+MissionCalendar.Key(p.endsAt,0)+(id!=s.Missions.season.id?" · Kulanz bis "+MissionCalendar.Key(p.claimUntil,0):"")+"\nXP durch rechtzeitiges Abholen von Missionen. Neue Seasons beginnen ohne alte XP.",72);
   if(track==1)Text("SeasonPremiumAccess",SeasonRules.Premium(s,id)?"Premium-Berechtigung für diese Season vorhanden.":"Premium benötigt eine bestätigte Berechtigung. Die Kaufanbindung ist noch nicht verfügbar. Free-Belohnungen bleiben unabhängig erreichbar.",90);
   foreach(var reward in SeasonBalance.Rewards[SeasonRules.Theme(id)].Where(r=>r.Track==track&&r.Level>band*10&&r.Level<=(band+1)*10))
   {
    int level=reward.Level;var card=Card("SeasonReward-"+level,"Stufe "+level+" · "+(track==0?"Free":"Premium"),()=>game.Act(v=>SeasonRules.Claim(v,seasonId,level,chosenTrack),"season-claim"));string contents=(VoucherRules.SeasonAward(level,track)>0?"+1 Gumball-Gutschein · ":"")+(reward.Gems>0?reward.Gems+" Gems · ":"")+(reward.Component!=""?reward.Amount+" "+ItemBalance.ComponentNames[Array.IndexOf(ItemBalance.ComponentIds,reward.Component)]+" · ":"")+(reward.Chest!=""?ChestLabel(reward.Chest)+" · ":"")+(reward.Item!=""?ItemBalance.Items[Workshop.Index(reward.Item)].Name+" ("+ItemBalance.Rarities[reward.Rarity]+") · ":"")+(reward.Artifact!=""?"Season-Artefakt":"");
    if(VoucherRules.SeasonAward(level,track)>0&&reward.Item==""&&reward.Component==""){card.Icon.gameObject.SetActive(true);card.Icon.sprite=VoucherSprite.Get();card.Icon.preserveAspect=true;}
    if(reward.Item!=""){card.Icon.gameObject.SetActive(true);card.Icon.color=Color.clear;var portrait=Instantiate(game.WorkshopPrefab.PortraitPrefab,card.Icon.transform);var r=(RectTransform)portrait.transform;r.anchorMin=r.anchorMax=new Vector2(.5f,.5f);r.sizeDelta=new Vector2(58,58);r.anchoredPosition=Vector2.zero;portrait.Bind(new ItemInstance{type=reward.Item,rarity=reward.Rarity});portrait.Caption.text="";portrait.Button.interactable=false;portrait.Button.targetGraphic.raycastTarget=false;}
    else if(reward.Component!=""){card.Icon.gameObject.SetActive(true);card.Icon.sprite=game.WorkshopPrefab.ComponentSprites[Array.IndexOf(ItemBalance.ComponentIds,reward.Component)];card.Icon.preserveAspect=true;}
    refresh.Add(()=>{string block=SeasonRules.Block(game.State,seasonId,level,chosenTrack);card.Detail.text=contents.TrimEnd(' ','·')+"\n"+(block??"Abholen");card.Button.interactable=game.Writable&&block==null;});
   }
   Text("SeasonChestsTitle","VERDIENTE TRUHEN · "+s.Rewards.chests.Length+" / "+SeasonBalance.MaxChests,54);
   foreach(var chest in s.Rewards.chests){long chestId=chest.id;var card=Card("SeasonChest-"+chestId,ChestLabel(chest.tier)+" #"+chestId,()=>game.Act(v=>SeasonRules.OpenChest(v,chestId)));card.Detail.text=chest.seasonId+"\nÖffnen · Originaler Material-/Itempool";refresh.Add(()=>card.Button.interactable=game.Writable&&!ChallengeRules.Active(game.State)&&game.State.Rewards.chests.Any(c=>c.id==chestId));}
   if(s.Rewards.chests.Length==0)Text("SeasonNoChests","Keine ungeöffneten Truhen.",54);
   if(s.Rewards.hasReceipt&&s.Rewards.receipt.payment=="season"){var r=s.Rewards.receipt;Text("SeasonReceipt","Zuletzt geöffnet: "+r.tier+" · "+r.components.Sum()+" Komponenten"+(r.hasItem?" · "+ItemBalance.Items[Workshop.Index(r.item.type)].Name+" ("+ItemBalance.Rarities[r.item.rarity]+")":""),90);}
  }
 }
}
