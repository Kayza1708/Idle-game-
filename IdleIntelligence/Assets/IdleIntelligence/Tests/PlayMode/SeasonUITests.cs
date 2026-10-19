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
 public sealed class SeasonUITests
 {
  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-season-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static Button B(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);return b;}
  static void Click(string name){var b=B(name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  IEnumerator Open(){Click("ResearchTab");yield return null;Click("SeasonAccess");yield return null;}
  void Prepare(bool premium=false){Debug.Log("PREPARED_SEASON_UI: XP / optional entitlement fixture only; no SDK purchase or natural acquisition claim");game.Act(s=>{var n=s.Copy();n.Missions.season.xp=50000;if(premium)n.Rewards.owned=new[]{SeasonRules.Product(n.Missions.season.id)};return n;});}
  void ScrollTo(string name){Canvas.ForceUpdateCanvases();var scroll=game.Content.GetComponentInParent<ScrollRect>();var target=GameObject.Find(name).GetComponent<RectTransform>();var content=(RectTransform)game.Content;float y=-content.InverseTransformPoint(target.TransformPoint(target.rect.center)).y;scroll.verticalNormalizedPosition=Mathf.Clamp01(1-(y-scroll.viewport.rect.height*.3f)/Math.Max(1,content.rect.height-scroll.viewport.rect.height));Canvas.ForceUpdateCanvases();}
  [UnityTest]public IEnumerator OriginalFreeRewardsPortraitsAndEarnedChestsAreReachableAndSavedOnce()
  {Prepare();yield return Open();WorkshopTests.Capture(390,844,"/tmp/unity-seasons-prepared-overview-390.png");var old=B("SeasonReward-5");old.onClick.Invoke();old.onClick.Invoke();Assert.That(game.State.Missions.season.claimed,Is.EqualTo(new[]{5}));Assert.That(game.State.Rewards.chests.Length,Is.EqualTo(1));yield return null;ScrollTo("SeasonChest-1");WorkshopTests.Capture(390,844,"/tmp/unity-seasons-prepared-chest-390.png");var chest=B("SeasonChest-1");chest.onClick.Invoke();chest.onClick.Invoke();Assert.That(game.State.Rewards.chests,Is.Empty);Assert.That(game.State.Rewards.shopRevision,Is.EqualTo(1));Assert.That(game.State.Rewards.receipt.components.Sum(),Is.GreaterThan(0));Click("SeasonReward-10");Assert.That(game.State.Workshop.inventory.Last().type,Is.EqualTo("impulse-relay"));Assert.That(game.State.Workshop.inventory.Last().rarity,Is.EqualTo(1));yield return null;Click("SeasonBand-4");yield return null;Click("SeasonReward-50");Assert.That(game.State.Retention.artifacts,Does.Contain("season-01-core"));Click("SeasonCollectionAccess");yield return null;Assert.That(GameObject.Find("SeasonArtifact-season-01-core"),Is.Not.Null);Assert.That(GameObject.Find("SeasonCollectionBonus").GetComponent<Text>().text,Does.Contain("Einnahmenfaktor"));Click("SeasonCollectionAccess");Click("SeasonTrack-1");yield return null;Assert.That(B("SeasonReward-50").interactable,Is.False);Assert.That(GameObject.Find("SeasonPremiumAccess").GetComponent<Text>().text,Does.Contain("nicht verfügbar"));Click("SeasonTrack-0");Click("SeasonBand-0");yield return null;ScrollTo("SeasonReward-10");foreach(int width in new[]{320,390,430})WorkshopTests.Capture(width,width==320?568:width==390?844:932,"/tmp/unity-seasons-prepared-"+width+".png");foreach(var b in game.Content.GetComponentsInChildren<Button>())Assert.That(b.GetComponent<RectTransform>().rect.height,Is.GreaterThanOrEqualTo(44),b.name);var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Missions.season.claimed,Does.Contain(50));Assert.That(loaded.State.Rewards.receipt.id,Is.EqualTo(1));Assert.That(loaded.State.Rewards.owned,Is.Empty);}
  [UnityTest]public IEnumerator PreparedPremiumEntitlementIsScopedToItsSeasonAndClaimFailureRollsBack()
  {Prepare(true);yield return Open();Click("SeasonTrack-1");yield return null;Click("SeasonReward-10");Assert.That(game.State.Workshop.inventory.Last().rarity,Is.EqualTo(2));Assert.That(game.State.Missions.season.premiumClaimed,Is.EqualTo(new[]{10}));Assert.That(SeasonRules.Premium(game.State,"season-02"),Is.False);long gems=game.State.Retention.gems;File.WriteAllText(game.SavePath,"season-damaged-original");Click("SeasonReward-1");Assert.That(game.Writable,Is.False);Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Missions.season.premiumClaimed,Is.EqualTo(new[]{10}));Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo("season-damaged-original"));}
 }
}
