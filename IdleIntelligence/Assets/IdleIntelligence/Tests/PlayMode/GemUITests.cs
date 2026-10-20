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
 public sealed class GemUITests
 {
  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-gem-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static Button B(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);return b;}
  static void Click(string name){var b=B(name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  IEnumerator Open(){Click("ResearchTab");yield return null;Click("GemAccess");yield return null;}
  void Prepare(){Debug.Log("FUNDED_GEM_UI: prepared Gems, prestige, F01 and data only; actual purchases, no real provider");game.Act(s=>{var n=s.Copy();n.Retention.gems=100000;n.Prestige.resets=1;n.Workshop.nodes=new[]{"F01"};n.Prestige.known=new[]{"F01"};n.Data=ScientificNumber.From(1e20);return n;});}
  [UnityTest]public IEnumerator PermanentOffersAndCapsulesAreReachableExactlyOnceAndSaved()
  {Prepare();yield return Open();long gems=game.State.Retention.gems;var old=B("GemOffer-offline-12");old.onClick.Invoke();old.onClick.Invoke();Assert.That(game.State.Retention.gems,Is.EqualTo(gems-250));Assert.That(game.State.Upgrades.offlineSeconds,Is.EqualTo(43200));yield return null;Click("GemOffer-lab-slot-1");Assert.That(PrestigeAutomation.LabCount(game.State),Is.EqualTo(3));yield return null;Click("GemPage-capsule");yield return null;gems=game.State.Retention.gems;old=B("CapsuleDraw");old.onClick.Invoke();long after=game.State.Retention.gems;old.onClick.Invoke();Assert.That(game.State.Capsules.draws,Is.EqualTo(1));Assert.That(game.State.Retention.gems,Is.EqualTo(after));Assert.That(game.State.Capsules.last.payment,Is.EqualTo("gems"));yield return null;Assert.That(GameObject.Find("CapsuleReceipt"),Is.Not.Null);foreach(int width in new[]{320,390,430})WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-gems-funded-capsule-"+width+".png");Canvas.ForceUpdateCanvases();game.Content.GetComponentInParent<ScrollRect>().verticalNormalizedPosition=1;yield return null;foreach(int width in new[]{320,390,430})WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-gems-funded-result-"+width+".png");Click("GemPage-time");yield return null;Assert.That(B("GemOffer-training-15m").interactable,Is.False);Click("GemOffer-lab-boost");yield return null;Assert.That(game.State.Upgrades.labBoostUntil,Is.GreaterThan(game.State.SavedAt));foreach(var button in game.Content.GetComponentsInChildren<Button>())Assert.That(button.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44),button.name);WorkshopTests.Capture(390,844,"/tmp/unity-gems-funded-time-390.png");var load=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(load.Writable,Is.True,load.Message);Assert.That(load.State.Capsules.draws,Is.EqualTo(1));Assert.That(load.State.Upgrades.purchasedLabs,Is.EqualTo(1));}
  [UnityTest]public IEnumerator UnavailableCapsuleVideoDoesNotSpendQuotaOrGrant()
  {Prepare();yield return Open();Click("GemPage-capsule");yield return null;long gems=game.State.Retention.gems;Click("CapsuleVideo");yield return null;Assert.That(game.State.Capsules.hasRequest,Is.False);Assert.That(game.State.Capsules.videos,Is.Zero);Assert.That(game.State.Capsules.draws,Is.Zero);Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(GameObject.Find("GemNotice").GetComponent<Text>().text,Does.Contain("Keine Werbequelle"));}
  [UnityTest]public IEnumerator FailedCapsuleSaveRestoresWalletAndReceipt()
  {Prepare();yield return Open();Click("GemPage-capsule");yield return null;long gems=game.State.Retention.gems;File.WriteAllText(game.SavePath,"gem-damaged-original");Click("CapsuleDraw");Assert.That(game.Writable,Is.False);Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Capsules.draws,Is.Zero);Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo("gem-damaged-original"));yield return null;Assert.That(B("CapsuleDraw").interactable,Is.False);}
 }
}
