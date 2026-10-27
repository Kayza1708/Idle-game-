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
 public sealed class PurchaseUITests
 {
  void OpenMenuRoute(string route){game.GetComponent<IdleIntelligence.Runtime.GameMenu>().Open();Click("Menu-"+route);}


  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-purchase-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static void Click(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  [UnityTest]public IEnumerator ProductCatalogAndRestoreAreReachableWithoutInventedPricesReceiptsOrRights()
  {Click("ResearchTab");yield return null;OpenMenuRoute("store");yield return null;var products=game.Content.GetComponentsInChildren<ActionCard>();Assert.That(products.Length,Is.EqualTo(10));foreach(var card in products){Assert.That(card.Button.interactable,Is.False);Assert.That(card.Detail.text,Does.Contain("Storepreis nicht verfügbar"));Assert.That(card.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44));}long gems=game.State.Retention.gems;Click("StoreRestore");yield return null;Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Rewards.owned,Is.Empty);Assert.That(game.State.Rewards.transactions,Is.Empty);Assert.That(game.State.Commerce.hasLast,Is.False);Assert.That(GameObject.Find("StoreNotice").GetComponent<Text>().text,Does.Contain("Keine Gutschrift"));foreach(int width in new[]{320,390,430})WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-purchase-unavailable-"+width+".png");}
  [UnityTest]public IEnumerator FailedVerifiedGrantSaveRollsBackAllConsumablesAndPermanentRights()
  {Debug.Log("INJECTED_VERIFIER_OUTPUT_TEST_ONLY: no runtime successful store provider");long gems=game.State.Retention.gems;File.WriteAllText(game.SavePath,"purchase-damaged-original");bool saved=game.Act(s=>PurchaseRules.Fulfill(s,new VerifiedPurchase{productId="ai_singularity.bundle.starter",transactionId="test-only",originalTransactionId="original",status="active"}));Assert.That(saved,Is.False);Assert.That(game.Writable,Is.False);Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Workshop.inventory,Is.Empty);Assert.That(game.State.Rewards.owned,Is.Empty);Assert.That(game.State.Rewards.transactions,Is.Empty);Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo("purchase-damaged-original"));yield return null;}
 }
}
