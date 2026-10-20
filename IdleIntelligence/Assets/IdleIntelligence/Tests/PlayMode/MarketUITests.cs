using System;
using System.IO;
using System.Linq;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
namespace IdleIntelligence.PlayTests
{
 public sealed class MarketUITests
 {
  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-market-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static Button B(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);return b;}
  static void Click(string name){var b=B(name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  IEnumerator Open(){Click("ResearchTab");yield return null;Click("MarketAccess");yield return null;}
  void ScrollTo(string name){Canvas.ForceUpdateCanvases();var scroll=game.Content.GetComponentInParent<ScrollRect>();var target=GameObject.Find(name).GetComponent<RectTransform>();var content=(RectTransform)game.Content;float y=-content.InverseTransformPoint(target.TransformPoint(target.rect.center)).y;scroll.verticalNormalizedPosition=Mathf.Clamp01(1-(y-scroll.viewport.rect.height*.3f)/Math.Max(1,content.rect.height-scroll.viewport.rect.height));Canvas.ForceUpdateCanvases();}
  void Prepare(){Debug.Log("FUNDED_MARKET_UI: prepared Gem stock only; actual debit/grant transactions, no purchase provider");game.Act(s=>{var n=s.Copy();n.Retention.gems=100000;return n;});}
  [UnityTest]public IEnumerator FreePaidMaterialsAndDailyItemUseAtomicTicketsAndActualPortraits()
  {Prepare();yield return Open();long gems=game.State.Retention.gems;var free=B("MarketOffer-free-common");free.onClick.Invoke();free.onClick.Invoke();Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Rewards.receipt.payment,Is.EqualTo("free"));Assert.That(Market.Quote(game.State,"free-common").Reason,Is.EqualTo("cooldown"));yield return null;Click("MarketMaterials");yield return null;var material=B("MarketOffer-material:circuits");long before=game.State.Workshop.components[0];material.onClick.Invoke();material.onClick.Invoke();Assert.That(game.State.Workshop.components[0],Is.EqualTo(before+(long)MarketBalance.MaterialAmounts[0]));Assert.That(game.State.Retention.gems,Is.EqualTo(gems-(long)MarketBalance.MaterialCosts[0]));yield return null;Click("MarketOffers");yield return null;string id="item:"+game.State.Market.rotation.day;var old=B("MarketOffer-"+id);int inventory=game.State.Workshop.inventory.Length;old.onClick.Invoke();old.onClick.Invoke();Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(inventory+1));Assert.That(game.State.Workshop.inventory.Last().rarity,Is.EqualTo((int)MarketBalance.DailyItemRarity));Assert.That(Market.Quote(game.State,id).Reason,Is.EqualTo("sold"));yield return null;Assert.That(GameObject.Find("MarketOffer-"+id).GetComponentInChildren<ItemPortrait>(),Is.Not.Null);ScrollTo("MarketOffer-"+id);WorkshopTests.Capture(390,844,"/tmp/unity-market-funded-item-390.png");Click("MarketOdds");yield return null;Assert.That(GameObject.Find("MarketOdds-legendary").GetComponent<ActionCard>().Detail.text,Does.Contain("70"));ScrollTo("MarketOdds-legendary");WorkshopTests.Capture(390,844,"/tmp/unity-market-funded-odds-390.png");Click("MarketOffers");yield return null;foreach(int width in new[]{320,390,430})WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-market-funded-"+width+".png");foreach(var button in game.Content.GetComponentsInChildren<Button>())Assert.That(button.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44),button.name);var load=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(Market.Quote(load.State,id).Reason,Is.EqualTo("sold"));Assert.That(Market.Quote(load.State,"free-common").Reason,Is.EqualTo("cooldown"));}
  [UnityTest]public IEnumerator UnavailableProviderClearsSavedTicketWithoutGrantOrLimitConsumption()
  {yield return Open();long revision=game.State.Rewards.shopRevision,gems=game.State.Retention.gems,components=game.State.Workshop.components.Sum();Click("MarketVideo");yield return null;Assert.That(game.State.Market.hasPending,Is.False);Assert.That(game.State.Market.adWindowUsed,Is.Zero);Assert.That(game.State.Rewards.shopRevision,Is.EqualTo(revision));Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Workshop.components.Sum(),Is.EqualTo(components));Assert.That(GameObject.Find("MarketNotice").GetComponent<Text>().text,Does.Contain("Keine Werbequelle"));var load=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(load.State.Market.hasPending,Is.False);Assert.That(load.State.Market.adWindowUsed,Is.Zero);}
  [UnityTest]public IEnumerator FailedMarketSaveRestoresDebitStockAndItemReceipt()
  {Prepare();yield return Open();long gems=game.State.Retention.gems,revision=game.State.Rewards.shopRevision;var components=(long[])game.State.Workshop.components.Clone();int inventory=game.State.Workshop.inventory.Length;File.WriteAllText(game.SavePath,"market-damaged-original");Click("MarketOffer-chest:legendary");Assert.That(game.Writable,Is.False);Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Rewards.shopRevision,Is.EqualTo(revision));Assert.That(game.State.Workshop.components,Is.EqualTo(components));Assert.That(game.State.Workshop.inventory.Length,Is.EqualTo(inventory));Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo("market-damaged-original"));yield return null;Assert.That(B("MarketOffer-chest:legendary").interactable,Is.False);}
 }
}
