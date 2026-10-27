using System;
using System.IO;
using System.Collections;
using IdleIntelligence.Core;
using IdleIntelligence.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;
namespace IdleIntelligence.PlayTests
{
    public sealed class BootTests
    {
        string directory;
        [SetUp] public void Setup() { directory=Path.Combine(Path.GetTempPath(),"idle-boot-"+Guid.NewGuid());Directory.CreateDirectory(directory);GameRuntime.SavePathOverride=Path.Combine(directory,"save.json");GameBoot.HoldForCapture=true; }
        [UnityTearDown] public IEnumerator Cleanup() { GameBoot.HoldForCapture=false;var boot=UnityEngine.Object.FindFirstObjectByType<GameBoot>();if(boot!=null)UnityEngine.Object.Destroy(boot.gameObject);var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();if(game!=null)UnityEngine.Object.Destroy(game.gameObject);yield return null;GameRuntime.SavePathOverride=null; }
        IEnumerator Open() { yield return SceneManager.LoadSceneAsync("Boot");GameBoot boot=null;float deadline=Time.realtimeSinceStartup+15;while(Time.realtimeSinceStartup<deadline){boot=UnityEngine.Object.FindFirstObjectByType<GameBoot>();if(boot!=null&&boot.Ready)break;yield return null;}Assert.That(boot,Is.Not.Null);Assert.That(boot.Ready,Is.True,boot.Status?.text); }
        [UnityTest] public IEnumerator FreshStartupUsesRealEntryAndReachesPlayableScene() { yield return Open();var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.Writable,Is.True);Assert.That(game.State.Credits.ToDouble(),Is.EqualTo(Balance.StartCredits).Within(1));Assert.That(game.State.Retention.aiName,Is.Empty);GameBoot.HoldForCapture=false;yield return null;yield return null;Assert.That(UnityEngine.Object.FindFirstObjectByType<GameBoot>(),Is.Null); }
        [UnityTest] public IEnumerator DamagedSaveRoutesToRecoveryAndPreservesOriginal() { string original="{damaged original";File.WriteAllText(GameRuntime.SavePathOverride,original);yield return Open();var game=UnityEngine.Object.FindFirstObjectByType<GameRuntime>();Assert.That(game.Writable,Is.False);Assert.That(game.CurrentTab,Is.EqualTo("storage"));Assert.That(File.ReadAllText(GameRuntime.SavePathOverride),Is.EqualTo(original)); }
        [UnityTest] public IEnumerator StartupUsesSavedLanguageAndFitsPortraitWidths() { var s=Game.New(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());s.Settings.language="en";var store=new AtomicSaveStore(GameRuntime.SavePathOverride,new UnitySaveCodec());store.Load(s.SavedAt);store.Save(s);yield return Open();var boot=UnityEngine.Object.FindFirstObjectByType<GameBoot>();Assert.That(boot.Status.text,Is.EqualTo("Save checked"));Directory.CreateDirectory("/tmp/idle-boot-review");var main=UnityEngine.Object.FindFirstObjectByType<GameRuntime>().Content.GetComponentInParent<Canvas>();main.gameObject.SetActive(false);foreach(int width in new[]{320,390,430}){PortraitGameView.Set(width,width==320?694:width==390?846:932);yield return null;yield return null;WorkshopTests.Capture(width,Screen.height,"/tmp/idle-boot-review/boot-en-"+width+".png");Assert.That(boot.Status.rectTransform.rect.width,Is.GreaterThan(200));}main.gameObject.SetActive(true); }
    }
}
