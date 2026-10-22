using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IdleIntelligence.Core;
using UnityEngine;
using UnityEngine.UI;
namespace IdleIntelligence.Runtime
{
 public sealed class NativeStoreView:MonoBehaviour
 {
  GameRuntime game;Text notice;CancellationTokenSource cancellation;readonly PurchaseService service=new PurchaseService(new UnavailableShopNativeAdapter(),new UnavailablePurchaseVerifier());
  public void Initialize(GameRuntime runtime){game=runtime;WorkshopUIFactory.Label("StoreHeader",transform,"Pakete & Vorteile",18,44);notice=WorkshopUIFactory.Label("StoreNotice",transform,"Store und serverseitige Kaufprüfung sind nicht angebunden. Keine Preise oder Käufe verfügbar.",14,90);WorkshopUIFactory.Button("StoreRestore",transform,"Käufe wiederherstellen · nicht verfügbar",()=>Request(null,true));foreach(var product in CommerceBalance.Products.Where(p=>p.Kind!="season"||p.Id.EndsWith(game.State.Missions.season.id.Split('-')[1],StringComparison.Ordinal))){var p=product;var card=Instantiate(game.CardPrefab,transform);card.name="StoreProduct-"+p.Id;card.Icon.gameObject.SetActive(false);card.Title.fontSize=16;card.Detail.fontSize=14;card.Title.text=p.Kind=="adfree"?"Werbefrei-Pass":p.Kind=="income"?"Dauerhaft "+CommerceBalance.IncomeMultiplier+"× Einkommen":p.Kind=="season"?"Premium Season Pass":p.Kind=="starter"?"Starterpaket":p.Kind=="builder"?"Baumeisterpaket":p.Kind=="lab"?"Laborvorrat":p.Gems+" Gems";card.GetComponent<LayoutElement>().preferredHeight=p.Kind=="starter"?250:190;card.Detail.text=(p.Once?"Einmalig":"Wiederholbar")+"\n"+(game.State.Rewards.owned.Contains(p.Id)?"Im Besitz":p.Gems>0?p.Gems+" Gems":"Dauerhaftes Recht")+string.Concat(p.Components.Select((n,i)=>n>0?"\n"+ItemBalance.ComponentNames[i]+" × "+n:""))+(p.Kind=="starter"?"\n"+string.Join(", ",CommerceBalance.StarterTypes.Select((t,i)=>ItemBalance.Rarities[CommerceBalance.StarterRarities[i]]+" "+ItemBalance.Items[Workshop.Index(t)].Name)):"")+"\nStorepreis nicht verfügbar";card.Button.interactable=false;card.Button.onClick.AddListener(()=>Request(p.Id,false));}}
  async void Request(string product,bool restoring){if(cancellation!=null)return;string campaign=game.State.Missions.campaign;cancellation=new CancellationTokenSource();var request=cancellation;string result=await service.Run(product,restoring,grants=>{bool saved=game!=null&&game.Writable&&campaign==game.State.Missions.campaign&&!ChallengeRules.Active(game.State)&&game.Act(s=>{var n=s;foreach(var p in grants)n=PurchaseRules.Fulfill(n,p,restoring);return grants.All(p=>PurchaseRules.Fulfilled(n,p))?n.Copy():s;});return Task.FromResult(saved);},request.Token);if(this!=null){notice.text=result=="unavailable"?"Store oder Kaufprüfung nicht verfügbar. Keine Gutschrift und kein abgeschlossener Kauf.":result=="persisted"?"Verifizierte Rechte dauerhaft gespeichert.":result=="save-failed"?"Nicht gespeichert. Storetransaktion bleibt unbestätigt.":"Kaufstatus: "+result;cancellation=null;}request.Dispose();}
  void OnDisable(){cancellation?.Cancel();}
 }
}
