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
 public sealed class RetentionUITests
 {
  string dir;GameRuntime game;
  [UnitySetUp]public IEnumerator Setup(){dir=Path.Combine(Path.GetTempPath(),"unity-retention-ui-"+Guid.NewGuid());Directory.CreateDirectory(dir);GameRuntime.SavePathOverride=Path.Combine(dir,"save.json");yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();}
  [UnityTearDown]public IEnumerator Cleanup(){if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null;Directory.Delete(dir,true);}
  static Button Button(string name){var b=GameObject.Find(name)?.GetComponent<Button>();Assert.That(b,Is.Not.Null,name);return b;}
  static void Click(string name){var b=Button(name);Assert.That(b.interactable,Is.True,name);b.onClick.Invoke();}
  void PaidHardware(int classes=1,int amount=25){Debug.Log("FUNDED_RETENTION_UI_STATE: temporary credit stock; actual paid hardware transactions, not a natural run");game.Act(s=>{var n=s.Copy();n.Credits=ScientificNumber.From(1e200);foreach(var h in Balance.Hardware.Take(classes))n=Game.Buy(n,h.Id,amount);return n;});}
  IEnumerator Open(){Click("ResearchTab");yield return null;Click("ProfileAccess");yield return null;}
  void ScrollTo(string name){Canvas.ForceUpdateCanvases();var scroll=game.Content.GetComponentInParent<ScrollRect>();var target=GameObject.Find(name).GetComponent<RectTransform>();var content=(RectTransform)game.Content;float y=-content.InverseTransformPoint(target.TransformPoint(target.rect.center)).y;scroll.verticalNormalizedPosition=Mathf.Clamp01(1-(y-scroll.viewport.rect.height*.3f)/Math.Max(1,content.rect.height-scroll.viewport.rect.height));Canvas.ForceUpdateCanvases();}
  [UnityTest]public IEnumerator ActualAchievementClaimsPersistBeforeRefreshAndOldCallbacksCannotPayTwice()
  {
   PaidHardware();yield return Open();var old=Button("Achievement-hardware");long gems=game.State.Retention.gems;var income=Game.Income(game.State);old.onClick.Invoke();old.onClick.Invoke();Assert.That(game.State.Retention.achievementClaims,Is.EqualTo(new[]{"hardware:0"}));Assert.That(game.State.Retention.points,Is.EqualTo((long)RetentionBalance.TierPoints[0]));Assert.That(game.State.Retention.gems,Is.EqualTo(gems+(long)RetentionBalance.TierGems[0]));Assert.That(Game.Income(game.State).CompareTo(income),Is.GreaterThan(0));var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.Writable,Is.True,loaded.Message);Assert.That(loaded.State.Retention.achievementClaims,Is.EqualTo(game.State.Retention.achievementClaims));yield return null;ScrollTo("Achievement-hardware");WorkshopTests.Capture(320,568,"/tmp/unity-retention-funded-320.png");WorkshopTests.Capture(390,844,"/tmp/unity-retention-funded-390.png");WorkshopTests.Capture(430,932,"/tmp/unity-retention-funded-430.png");
  }
  [UnityTest]public IEnumerator ProfilePolicyFirstAIChoiceAndMailboxAreReachableAndReloadable()
  {
   yield return Open();Click("ShowProfile");yield return null;Click("ShowNameLicenses");yield return null;Assert.That(GameObject.Find("License-NameModerationLicense-0").GetComponent<Text>().text,Does.Contain("Creative Commons"));Click("ShowProfile");yield return null;GameObject.Find("PlayerNameInput").GetComponent<InputField>().text="  Nova   7  ";Click("PlayerNameSave");Assert.That(game.State.Retention.playerName,Is.EqualTo("Nova 7"));yield return null;GameObject.Find("PlayerNameInput").GetComponent<InputField>().text="Arschloch";Click("PlayerNameSave");Assert.That(game.State.Retention.playerName,Is.EqualTo("Nova 7"));Assert.That(GameObject.Find("PlayerNameError").GetComponent<Text>().text,Does.Contain("anderen Namen"));GameObject.Find("AINameInput").GetComponent<InputField>().text=" AURA ";Click("AINameSave");Assert.That(game.State.Retention.aiName,Is.EqualTo("AURA"));Assert.That(GameObject.Find("AINameInput"),Is.Null,"AI name is a first choice, not repeatable renaming");Click("Read-progression-v2");Assert.That(game.State.Retention.readMessages,Is.EqualTo(new[]{"progression-v2"}));yield return SceneManager.LoadSceneAsync("IdleIntelligence");yield return null;game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.State.Retention.playerName,Is.EqualTo("Nova 7"));Assert.That(game.State.Retention.aiName,Is.EqualTo("AURA"));Assert.That(game.State.Retention.readMessages,Is.EqualTo(new[]{"progression-v2"}));
  }
  [UnityTest]public IEnumerator OnboardingAndStaticChallengeUsePaidProgressAndOneTimeReceipts()
  {
   PaidHardware(5,500);yield return Open();Click("ShowOnboarding");yield return null;var old=Button("Intro-first-buy");old.onClick.Invoke();old.onClick.Invoke();Assert.That(game.State.Retention.onboardingClaimed,Is.EqualTo(new[]{"first-buy"}));Click("ShowStaticChallenges");yield return null;var challenge=Button("StaticChallenge-first-empire");challenge.onClick.Invoke();challenge.onClick.Invoke();Assert.That(game.State.Challenges.Progress.stars,Is.EqualTo(1));Assert.That(game.State.Retention.challengeClaims,Is.EqualTo(new[]{"first-empire"}));var loaded=new AtomicSaveStore(game.SavePath,new UnitySaveCodec()).Load(game.State.SavedAt);Assert.That(loaded.State.Retention.challengeClaims,Is.EqualTo(game.State.Retention.challengeClaims));
  }
  [UnityTest]public IEnumerator FailedPermanentRewardSaveRestoresWalletAndKeepsDamagedOriginal()
  {
   PaidHardware();yield return Open();long gems=game.State.Retention.gems;string damaged="external damage must not be replaced";File.WriteAllText(game.SavePath,damaged);LogAssert.Expect(LogType.Warning,new System.Text.RegularExpressions.Regex("Speichern gesperrt"));Click("Achievement-hardware");Assert.That(game.Writable,Is.False);Assert.That(game.State.Retention.points,Is.Zero);Assert.That(game.State.Retention.gems,Is.EqualTo(gems));Assert.That(game.State.Retention.achievementClaims,Is.Empty);Assert.That(File.ReadAllText(game.SavePath),Is.EqualTo(damaged));
  }
 }
}
